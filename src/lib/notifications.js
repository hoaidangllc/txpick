// Notification foundation for TXPick.
// - Local notification: works while app/PWA is open.
// - Web Push: works from server cron after the user installs/opens PWA and allows notifications.

import { supabase, SUPABASE_CONFIGURED } from './supabase.js'

const NOTIFIED_KEY = 'txpick_notified_v4'
const DAILY_KEY = 'txpick_daily_briefing_notified_v1'
const PUSH_STATUS_KEY = 'txpick_push_status_v1'

export function notificationSupported() {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined'
}

export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    notificationSupported()
  )
}

export async function ensurePermission() {
  if (!notificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

function loadNotified() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')) }
  catch { return new Set() }
}

function saveNotified(set) {
  try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set].slice(-500))) } catch {}
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function alreadySentDailyBriefing() {
  try { return localStorage.getItem(DAILY_KEY) === todayKey() } catch { return false }
}

export function markDailyBriefingSent() {
  try { localStorage.setItem(DAILY_KEY, todayKey()) } catch {}
}

function notify({ title, body, tag, url = '/today' }) {
  if (!notificationSupported() || Notification.permission !== 'granted') return false
  try {
    const n = new Notification(title, {
      body,
      tag,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url },
    })
    n.onclick = () => {
      try {
        window.focus()
        window.location.assign(url)
      } catch {}
    }
    return true
  } catch {
    return false
  }
}

function dueDateTime(item) {
  if (item.due_at) return new Date(item.due_at)
  if (item.date) return new Date(`${item.date}T${item.time || '09:00'}:00`)
  if (item.dueDate || item.due_date) return new Date(`${item.dueDate || item.due_date}T09:00:00`)
  return null
}

export function fireDueNotifications({ reminders = [], bills = [], lang = 'vi' }, now = new Date()) {
  if (!notificationSupported() || Notification.permission !== 'granted') return 0

  const notified = loadNotified()
  let fired = 0

  for (const r of reminders) {
    if (r.done || r.completed) continue
    const due = dueDateTime(r)
    if (!due || Number.isNaN(due.getTime()) || due > now) continue
    const key = `reminder:${r.id}:${due.toISOString()}`
    if (notified.has(key)) continue
    const ok = notify({
      title: lang === 'vi' ? `Nhắc việc: ${r.title || 'Việc cần nhớ'}` : `Reminder: ${r.title || 'Reminder'}`,
      body: r.notes || (lang === 'vi' ? 'Đã tới giờ cần làm việc này.' : 'This reminder is due.'),
      tag: key,
      url: '/reminders',
    })
    if (ok) { notified.add(key); fired += 1 }
  }

  for (const b of bills) {
    if (b.paid) continue
    const due = dueDateTime(b)
    if (!due || Number.isNaN(due.getTime())) continue
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000)
    if (diffDays > 2) continue
    const key = `bill:${b.id}:${due.toISOString()}`
    if (notified.has(key)) continue
    const ok = notify({
      title: lang === 'vi' ? `Hóa đơn sắp tới hạn: ${b.name || b.title}` : `Bill due soon: ${b.name || b.title}`,
      body: lang === 'vi' ? 'Kiểm tra và mark paid nếu đã trả xong.' : 'Review and mark paid when complete.',
      tag: key,
      url: '/bills',
    })
    if (ok) { notified.add(key); fired += 1 }
  }

  if (fired) saveNotified(notified)
  return fired
}

export function fireDailyBriefingNotification(lines = [], lang = 'vi') {
  if (!notificationSupported() || Notification.permission !== 'granted') return false
  if (alreadySentDailyBriefing()) return false
  const body = Array.isArray(lines) ? lines.slice(0, 2).join(' ') : String(lines || '')
  const ok = notify({
    title: lang === 'vi' ? 'Tóm tắt hôm nay' : 'Today briefing',
    body: body || (lang === 'vi' ? 'Mở app để xem việc hôm nay.' : 'Open the app to review today.'),
    tag: `daily:${todayKey()}`,
    url: '/today',
  })
  if (ok) markDailyBriefingSent()
  return ok
}

export function startNotificationTicker(getPayload, intervalMs = 60_000) {
  let stopped = false
  const tick = () => {
    if (stopped) return
    try { fireDueNotifications(getPayload()) } catch {}
  }
  tick()
  const id = setInterval(tick, intervalMs)
  return () => { stopped = true; clearInterval(id) }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}


async function getVapidPublicKey() {
  const viteKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY
  if (viteKey) return viteKey
  try {
    const res = await fetch('/api/push/public-key')
    const json = await res.json().catch(() => ({}))
    return res.ok ? (json.publicKey || '') : ''
  } catch {
    return ''
  }
}

async function postJson(url, body) {
  const { data } = SUPABASE_CONFIGURED ? await supabase.auth.getSession() : { data: { session: null } }
  const token = data?.session?.access_token
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Unable to complete notification setup')
  return json
}



export function describePushProblem(code, lang = 'vi') {
  const vi = {
    unsupported: 'Điện thoại hoặc trình duyệt này chưa hỗ trợ thông báo. Trên iPhone, hãy thêm TXPick vào màn hình chính rồi mở từ icon app.',
    denied: 'Bạn đã chặn thông báo. Vào phần cài đặt của điện thoại hoặc trình duyệt để bật lại thông báo cho TXPick.',
    default: 'Bạn chưa cho phép thông báo. Bấm bật nhắc việc để điện thoại hỏi quyền.',
    missing_key: 'Thông báo chưa được cài đặt. Vui lòng liên hệ hỗ trợ.',
    no_browser_subscription: 'Điện thoại này chưa đăng ký nhận thông báo. Bấm bật nhắc việc để thử lại.',
    no_server_subscription: 'Điện thoại này chưa được lưu để nhận nhắc việc. Bấm bật nhắc việc để thử lại.',
    no_active_push_subscription: 'Tài khoản này chưa có điện thoại nào đăng ký nhận nhắc việc.',
    service_worker: 'App chưa sẵn sàng. Hãy tải lại trang hoặc mở TXPick từ icon màn hình chính.',
    unknown: 'Có lỗi xảy ra. Vui lòng thử lại sau ít phút.',
  }
  const en = {
    unsupported: 'This phone or browser does not support notifications yet. On iPhone, add TXPick to the Home Screen and open it from the app icon.',
    denied: 'Notifications are blocked. Open your phone or browser settings and allow notifications for TXPick.',
    default: 'Notifications have not been allowed yet. Tap enable reminders so the phone can ask for permission.',
    missing_key: 'Notifications are not set up yet. Please contact support.',
    no_browser_subscription: 'This phone is not registered for notifications yet. Tap enable reminders to try again.',
    no_server_subscription: 'This phone has not been saved for reminders yet. Tap enable reminders to try again.',
    no_active_push_subscription: 'This account does not have any phone registered for reminders yet.',
    service_worker: 'The app is not ready yet. Reload the page or open TXPick from the Home Screen icon.',
    unknown: 'Something went wrong. Please try again in a moment.',
  }
  const map = lang === 'vi' ? vi : en
  return map[code] || map.unknown
}

export async function getPushStatus() {
  if (!pushSupported()) return { supported: false, permission: notificationSupported() ? Notification.permission : 'unsupported', subscribed: false, browserSubscribed: false }
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return {
      supported: true,
      permission: Notification.permission,
      subscribed: Boolean(sub),
      browserSubscribed: Boolean(sub),
      endpoint: sub?.endpoint || '',
      endpointStart: sub?.endpoint ? sub.endpoint.slice(0, 80) : '',
      serviceWorkerReady: true,
    }
  } catch {
    return { supported: true, permission: Notification.permission, subscribed: false, browserSubscribed: false, serviceWorkerReady: false }
  }
}

async function currentBrowserSubscription() {
  if (!pushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

export async function checkServerPushStatus() {
  const sub = await currentBrowserSubscription().catch(() => null)
  return postJson('/api/push/status', { endpoint: sub?.endpoint || null })
}

export async function cleanupStalePushSubscriptions(keepEndpoint = null) {
  return postJson('/api/push/cleanup', { keepEndpoint })
}

export async function diagnosePushSetup() {
  const local = await getPushStatus()
  let server = null
  let serverError = null
  try {
    server = await checkServerPushStatus()
  } catch (err) {
    serverError = err.message || 'Unable to check server push status'
  }
  return {
    ok: Boolean(local.supported && local.permission === 'granted' && local.browserSubscribed && server?.enabled > 0),
    local,
    server,
    serverError,
  }
}

export async function enableBackgroundReminders() {
  const steps = []
  if (!pushSupported()) {
    steps.push({ key: 'support', ok: false, message: 'Browser push is not supported.' })
    return { ok: false, status: 'unsupported', problem: 'unsupported', steps, message: 'Push notification is not supported on this browser.' }
  }
  steps.push({ key: 'support', ok: true, message: 'Browser supports push notifications.' })

  const permission = await ensurePermission()
  steps.push({ key: 'permission', ok: permission === 'granted', value: permission, message: `Notification permission: ${permission}` })
  if (permission !== 'granted') {
    return { ok: false, status: permission, problem: permission, steps, message: 'Notification permission was not granted.' }
  }

  const publicKey = await getVapidPublicKey()
  steps.push({ key: 'public_key', ok: Boolean(publicKey), message: publicKey ? 'VAPID public key found.' : 'Missing VAPID public key.' })
  if (!publicKey) {
    return { ok: false, status: 'missing_key', problem: 'missing_key', steps, message: 'Phone reminders are not configured yet.' }
  }

  let reg
  try {
    reg = await navigator.serviceWorker.ready
    steps.push({ key: 'service_worker', ok: true, message: 'Service worker is ready.' })
  } catch {
    steps.push({ key: 'service_worker', ok: false, message: 'Service worker is not ready.' })
    return { ok: false, status: 'service_worker', problem: 'service_worker', steps, message: 'Service worker is not ready.' }
  }

  let subscription = await reg.pushManager.getSubscription()
  if (subscription) {
    await cleanupStalePushSubscriptions(subscription.endpoint).catch(() => undefined)
  }
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }
  steps.push({ key: 'browser_subscription', ok: Boolean(subscription), endpointStart: subscription?.endpoint?.slice(0, 80) || '', message: 'Browser subscription created on this device.' })

  const result = await postJson('/api/push/subscribe', { subscription })
  steps.push({ key: 'phone_saved', ok: Boolean(result?.ok), message: result?.ok ? 'This phone is saved for reminders.' : 'Could not save this phone for reminders.' })

  let serverStatus = null
  try {
    serverStatus = await checkServerPushStatus()
    steps.push({ key: 'server_verify', ok: serverStatus?.enabled > 0, message: serverStatus?.enabled > 0 ? 'Reminders are ready to be sent to this account.' : 'No phone is registered for reminders yet.' })
  } catch (err) {
    steps.push({ key: 'server_verify', ok: false, message: err.message || 'Could not verify reminder setup.' })
  }

  try { localStorage.setItem(PUSH_STATUS_KEY, JSON.stringify({ enabledAt: new Date().toISOString() })) } catch {}
  return { ok: Boolean(serverStatus ? serverStatus.enabled > 0 : result?.ok), status: 'enabled', subscription, result, serverStatus, steps }
}

export async function disableBackgroundReminders() {
  if (!pushSupported()) return { ok: true, status: 'unsupported' }
  const reg = await navigator.serviceWorker.ready
  const subscription = await reg.pushManager.getSubscription()
  if (subscription) {
    await postJson('/api/push/unsubscribe', { endpoint: subscription.endpoint })
    await subscription.unsubscribe().catch(() => undefined)
  }
  try { localStorage.removeItem(PUSH_STATUS_KEY) } catch {}
  return { ok: true, status: 'disabled' }
}


export async function refreshBackgroundReminders() {
  if (!pushSupported()) return { ok: false, status: 'unsupported', problem: 'unsupported' }
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) {
    await postJson('/api/push/unsubscribe', { endpoint: existing.endpoint }).catch(() => undefined)
    await existing.unsubscribe().catch(() => undefined)
  }
  await cleanupStalePushSubscriptions().catch(() => undefined)
  try { localStorage.removeItem(PUSH_STATUS_KEY) } catch {}
  return enableBackgroundReminders()
}

export async function sendTestPush() {
  return postJson('/api/push/test', {})
}

export async function enableAndSendTestPush() {
  const setup = await enableBackgroundReminders()
  if (!setup.ok) return { ok: false, stage: 'setup', setup }
  const test = await sendTestPush()
  return { ok: true, stage: 'test', setup, test }
}
