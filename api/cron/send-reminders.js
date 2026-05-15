import { sendPush } from '../_push.js'
import { getServiceClient, requireCronAuth, sendJson } from '../_supabase.js'

const LOOKBACK_MINUTES = Number(process.env.REMINDER_LOOKBACK_MINUTES || 8)

function asDate(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function dayKey(d) {
  return d.toISOString().slice(0, 10)
}

function weekKey(d) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = x.getUTCDay() || 7
  x.setUTCDate(x.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((x - yearStart) / 86400000) + 1) / 7)
  return `${x.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function monthKey(d) {
  return d.toISOString().slice(0, 7)
}

function sameTimeWindow(base, now, lookbackMinutes = LOOKBACK_MINUTES) {
  const current = new Date(now)
  current.setUTCHours(base.getUTCHours(), base.getUTCMinutes(), 0, 0)
  const diff = now.getTime() - current.getTime()
  return diff >= 0 && diff <= lookbackMinutes * 60 * 1000
}

function occurrenceFor(reminder, now) {
  if (reminder.completed) return null
  const due = asDate(reminder.due_at)
  if (!due) return null
  const repeat = reminder.repeat_pattern || 'none'

  if (repeat === 'daily') {
    if (now < due) return null
    if (!sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:daily:${dayKey(now)}` }
  }

  if (repeat === 'weekly') {
    if (now < due) return null
    if (now.getUTCDay() !== due.getUTCDay()) return null
    if (!sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:weekly:${weekKey(now)}` }
  }

  if (repeat === 'monthly') {
    if (now < due) return null
    if (now.getUTCDate() !== due.getUTCDate()) return null
    if (!sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:monthly:${monthKey(now)}` }
  }

  const diff = now.getTime() - due.getTime()
  if (diff < 0 || diff > LOOKBACK_MINUTES * 60 * 1000) return null
  return { due, key: `${reminder.id}:once:${due.toISOString()}` }
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function categoryIcon(category) {
  const value = String(category || '').toLowerCase()
  if (value.includes('health') || value.includes('med')) return '💊'
  if (value.includes('bill')) return '💵'
  if (value.includes('expense') || value.includes('spend')) return '💳'
  if (value.includes('business') || value.includes('work')) return '💼'
  if (value.includes('family')) return '👨‍👩‍👧‍👦'
  return '🔔'
}

function formatDueTime(value) {
  const due = asDate(value)
  if (!due) return ''
  return due.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

function pushPayload(reminder) {
  const title = cleanText(reminder.title) || 'Việc cần nhớ'
  const notes = cleanText(reminder.notes)
  const time = formatDueTime(reminder.due_at)
  const timeText = time ? ` • ${time}` : ''
  return {
    title: `${categoryIcon(reminder.category)} ${title}`,
    body: notes || `Đến giờ làm việc này${timeText}. Mở TX Life để xem chi tiết.`,
    tag: `reminder-${reminder.id}`,
    url: '/reminders',
    data: { reminderId: reminder.id, category: reminder.category || 'personal' },
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireCronAuth(req)) return sendJson(res, 401, { error: 'Unauthorized cron request' })

  const supabase = getServiceClient()
  const now = new Date()
  const dueBefore = now.toISOString()
  const dueAfter = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { data: reminders, error: reminderError } = await supabase
      .from('reminders')
      .select('id, profile_id, title, notes, category, due_at, repeat_pattern, completed')
      .eq('completed', false)
      .lte('due_at', dueBefore)
      .gte('due_at', dueAfter)
      .limit(500)

    if (reminderError) throw reminderError

    const due = []
    for (const reminder of reminders || []) {
      const occ = occurrenceFor(reminder, now)
      if (occ) due.push({ reminder, occ })
    }

    if (!due.length) return sendJson(res, 200, { ok: true, checked: reminders?.length || 0, due: 0, sent: 0 })

    const keys = due.map((item) => item.occ.key)
    const { data: existingLogs, error: logError } = await supabase
      .from('push_notification_logs')
      .select('dedupe_key')
      .in('dedupe_key', keys)
    if (logError) throw logError

    const sentKeys = new Set((existingLogs || []).map((row) => row.dedupe_key))
    const pending = due.filter((item) => !sentKeys.has(item.occ.key))
    const profileIds = [...new Set(pending.map((item) => item.reminder.profile_id))]

    if (!profileIds.length) return sendJson(res, 200, { ok: true, checked: reminders?.length || 0, due: due.length, sent: 0 })

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('profile_id', profileIds)
      .eq('enabled', true)
    if (subsError) throw subsError

    const subsByProfile = new Map()
    for (const sub of subs || []) {
      if (!subsByProfile.has(sub.profile_id)) subsByProfile.set(sub.profile_id, [])
      subsByProfile.get(sub.profile_id).push(sub)
    }

    let sent = 0
    let failed = 0

    for (const item of pending) {
      const userSubs = subsByProfile.get(item.reminder.profile_id) || []
      if (!userSubs.length) continue
      let delivered = 0
      let lastError = null

      for (const sub of userSubs) {
        try {
          await sendPush({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, pushPayload(item.reminder))
          delivered += 1
          sent += 1
          await supabase.from('push_subscriptions').update({ last_sent_at: now.toISOString(), last_error: null, updated_at: now.toISOString() }).eq('id', sub.id)
        } catch (err) {
          failed += 1
          lastError = err.message || 'Push failed'
          const statusCode = err.statusCode || err.status
          const disable = statusCode === 404 || statusCode === 410
          await supabase.from('push_subscriptions').update({ enabled: disable ? false : sub.enabled, last_error: lastError, updated_at: now.toISOString() }).eq('id', sub.id)
        }
      }

      await supabase.from('push_notification_logs').insert({
        profile_id: item.reminder.profile_id,
        reminder_id: item.reminder.id,
        dedupe_key: item.occ.key,
        channel: 'web_push',
        status: delivered ? 'sent' : 'failed',
        delivered_count: delivered,
        error: delivered ? null : lastError,
      })
    }

    return sendJson(res, 200, { ok: true, checked: reminders?.length || 0, due: due.length, pending: pending.length, sent, failed })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to send reminders' })
  }
}
