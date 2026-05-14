// Browser-native notifications for due reminders.
// While the tab is open, we poll every minute and fire a notification when
// a reminder's dueAt falls in the past since the last check. Each reminder
// is only notified once per dueAt timestamp (we track in localStorage).
//
// Push notifications across tab close will need a service worker + a server.
// This file is the foundation we'll keep.

const NOTIFIED_KEY = 'txpick_notified'

export async function ensurePermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const res = await Notification.requestPermission()
    return res
  } catch {
    return 'denied'
  }
}

export function notificationSupported() {
  return typeof Notification !== 'undefined'
}

function loadNotified() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')) }
  catch { return new Set() }
}
function saveNotified(set) {
  try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set])) } catch {}
}

export function fireIfDue(reminders, now = new Date()) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return 0
  const notified = loadNotified()
  let fired = 0
  for (const r of reminders) {
    if (r.completedAt) continue
    const due = new Date(r.dueAt)
    if (due > now) continue
    const dedupe = r.id + '@' + due.toISOString()
    if (notified.has(dedupe)) continue
    try {
      new Notification('TxPick — ' + (r.title || 'Reminder'), {
        body: r.notes || (r.forPerson && r.forPerson !== 'me' ? 'Cho ' + r.forPerson : ''),
        tag: 'txpick-' + r.id,
        icon: '/favicon.svg',
      })
      notified.add(dedupe)
      fired++
    } catch { /* swallow */ }
  }
  if (fired) saveNotified(notified)
  return fired
}

export function startReminderTicker(getReminders, intervalMs = 60_000) {
  // Run once immediately, then every interval.
  let stopped = false
  const tick = () => {
    if (stopped) return
    try { fireIfDue(getReminders()) } catch {}
  }
  tick()
  const id = setInterval(tick, intervalMs)
  return () => { stopped = true; clearInterval(id) }
}
