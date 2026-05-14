// Browser notification foundation.
// This handles in-app/local notifications while the app is open or installed as a PWA.
// True background push still needs a server push provider later.

const NOTIFIED_KEY = 'txpick_notified_v2'

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
  try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set].slice(-300))) } catch {}
}

function notify({ title, body, tag }) {
  if (!notificationSupported() || Notification.permission !== 'granted') return false
  try {
    new Notification(title, { body, tag, icon: '/favicon.svg', badge: '/favicon.svg' })
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
      body: lang === 'vi' ? 'Kiểm tra và paid nếu đã tới hạn.' : 'Review and mark paid when complete.',
      tag: key,
    })
    if (ok) { notified.add(key); fired += 1 }
  }

  if (fired) saveNotified(notified)
  return fired
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
