// Browser notification foundation.
// Local notifications work while the app/PWA is open. True background push needs a server push provider later.

const NOTIFIED_KEY = 'txpick_notified_v3'
const DAILY_KEY = 'txpick_daily_briefing_notified_v1'

export async function ensurePermission() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export function notificationSupported() {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined'
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
      icon: '/icon-192.png',
      badge: '/icon-192.png',
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
