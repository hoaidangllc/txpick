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


function waitFor(promise, ms = 8000, label = 'Timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms)),
  ])
}

function shortEndpoint(endpoint = '') {
  if (!endpoint) return ''
  return endpoint.length > 46 ? `${endpoint.slice(0, 28)}…${endpoint.slice(-14)}` : endpoint
}

export async function getPushStatus() {
  if (!pushSupported()) return { supported: false, permission: 'unsupported', subscribed: false, endpoint: '' }
  const reg = await waitFor(navigator.serviceWorker.ready, 8000, 'Service worker is not ready yet')
  const sub = await reg.pushManager.getSubscription()
  return {
    supported: true,
    permission: Notification.permission,
    subscribed: Boolean(sub),
    endpoint: sub?.endpoint || '',
    endpointShort: shortEndpoint(sub?.endpoint || ''),
  }
}

export async function getPushDiagnostics() {
  const base = {
    browserSupportsNotifications: notificationSupported(),
    browserSupportsPush: pushSupported(),
    permission: notificationSupported() ? Notification.permission : 'unsupported',
    serviceWorkerReady: false,
    browserSubscribed: false,
    endpoint: '',
    endpointShort: '',
    publicKeyConfigured: false,
    signedIn: false,
    serverSubscriptionCount: null,
    serverEnabledCount: null,
    serverError: '',
  }

  try {
    base.publicKeyConfigured = Boolean(await getVapidPublicKey())
  } catch {}

  try {
    const { data } = SUPABASE_CONFIGURED ? await supabase.auth.getSession() : { data: { session: null } }
    base.signedIn = Boolean(data?.session?.access_token)
  } catch {}

  if (base.browserSupportsPush) {
    try {
      const reg = await waitFor(navigator.serviceWorker.ready, 8000, 'Service worker is not ready yet')
      base.serviceWorkerReady = Boolean(reg)
      const sub = await reg.pushManager.getSubscription()
      base.browserSubscribed = Boolean(sub)
      base.endpoint = sub?.endpoint || ''
      base.endpointShort = shortEndpoint(sub?.endpoint || '')
    } catch (err) {
      base.serverError = err.message || String(err)
    }
  }

  try {
    const server = await postJson('/api/push/status', { endpoint: base.endpoint || null })
    base.serverSubscriptionCount = server.total || 0
    base.serverEnabledCount = server.enabled || 0
    base.serverHasThisEndpoint = Boolean(server.hasThisEndpoint)
    base.serverEnvReady = Boolean(server.envReady)
    base.recentLogs = server.recentLogs || []
  } catch (err) {
    if (!base.serverError) base.serverError = err.message || 'Could not check server push status'
  }

  return base
}


export async function enableBackgroundReminders() {
  if (!pushSupported()) {
    return { ok: false, status: 'unsupported', message: 'This browser does not support background push reminders. On iPhone, install TXPick to the Home Screen and open it from the icon.' }
  }

  const permission = await ensurePermission()
  if (permission !== 'granted') {
    return { ok: false, status: permission, message: permission === 'denied' ? 'Notifications are blocked for this browser/app.' : 'Notification permission was not granted.' }
  }

  const publicKey = await getVapidPublicKey()
  if (!publicKey) {
    return { ok: false, status: 'missing_key', message: 'VAPID public key is missing. Check VITE_WEB_PUSH_PUBLIC_KEY in Vercel and local .env.' }
  }

  const reg = await waitFor(navigator.serviceWorker.ready, 8000, 'Service worker is not ready yet. Reopen the app and try again.')
  let subscription = await reg.pushManager.getSubscription()
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  const result = await postJson('/api/push/subscribe', { subscription })
  try { localStorage.setItem(PUSH_STATUS_KEY, JSON.stringify({ enabledAt: new Date().toISOString(), endpoint: subscription.endpoint })) } catch {}
  return { ok: true, status: 'enabled', subscription, result, endpointShort: shortEndpoint(subscription.endpoint) }
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

export async function sendTestPush() {
  return postJson('/api/push/test', {})
}
