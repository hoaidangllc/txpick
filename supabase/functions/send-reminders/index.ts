import { createClient } from 'npm:@supabase/supabase-js@2.45.4'
import webpush from 'npm:web-push@3.6.7'

type ReminderRow = {
  id: string
  profile_id: string
  title: string | null
  notes: string | null
  due_at: string | null
  category: string | null
  repeat_pattern: string | null
  completed: boolean | null
}

type PushSubscriptionRow = {
  id: string
  profile_id: string
  endpoint: string
  p256dh: string
  auth: string
  enabled: boolean
}

const LOOKBACK_MINUTES = Number(Deno.env.get('REMINDER_LOOKBACK_MINUTES') || 8)
const BATCH_LIMIT = Number(Deno.env.get('REMINDER_BATCH_LIMIT') || 500)
const ALLOWED_METHODS = new Set(['GET', 'POST'])

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function requireCronAuth(req: Request) {
  const secret = Deno.env.get('CRON_SECRET')
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}` || req.headers.get('x-cron-secret') === secret
}

function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

function configureWebPush() {
  const publicKey = Deno.env.get('WEB_PUSH_PUBLIC_KEY') || Deno.env.get('VITE_WEB_PUSH_PUBLIC_KEY')
  const privateKey = Deno.env.get('WEB_PUSH_PRIVATE_KEY')
  const subject = Deno.env.get('WEB_PUSH_SUBJECT') || 'mailto:support@txpick.app'
  if (!publicKey || !privateKey) throw new Error('Missing WEB_PUSH_PUBLIC_KEY/VITE_WEB_PUSH_PUBLIC_KEY or WEB_PUSH_PRIVATE_KEY')
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

function asDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function weekKey(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = x.getUTCDay() || 7
  x.setUTCDate(x.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((x.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${x.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7)
}

function sameTimeWindow(base: Date, now: Date, lookbackMinutes = LOOKBACK_MINUTES) {
  const current = new Date(now)
  current.setUTCHours(base.getUTCHours(), base.getUTCMinutes(), 0, 0)
  const diff = now.getTime() - current.getTime()
  return diff >= 0 && diff <= lookbackMinutes * 60 * 1000
}

function occurrenceFor(reminder: ReminderRow, now: Date) {
  if (reminder.completed) return null
  const due = asDate(reminder.due_at)
  if (!due) return null
  const repeat = reminder.repeat_pattern || 'none'

  if (repeat === 'daily') {
    if (now < due || !sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:daily:${dayKey(now)}` }
  }

  if (repeat === 'weekly') {
    if (now < due || now.getUTCDay() !== due.getUTCDay() || !sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:weekly:${weekKey(now)}` }
  }

  if (repeat === 'monthly') {
    if (now < due || now.getUTCDate() !== due.getUTCDate() || !sameTimeWindow(due, now)) return null
    return { due, key: `${reminder.id}:monthly:${monthKey(now)}` }
  }

  const diff = now.getTime() - due.getTime()
  if (diff < 0 || diff > LOOKBACK_MINUTES * 60 * 1000) return null
  return { due, key: `${reminder.id}:once:${due.toISOString()}` }
}

function cleanText(value: string | null | undefined) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function categoryIcon(category: string | null | undefined) {
  const value = String(category || '').toLowerCase()
  if (value.includes('health') || value.includes('med')) return '💊'
  if (value.includes('bill')) return '💵'
  if (value.includes('expense') || value.includes('spend')) return '💳'
  if (value.includes('business') || value.includes('work')) return '💼'
  if (value.includes('family')) return '👨‍👩‍👧‍👦'
  return '🔔'
}

function formatDueTime(value: string | null | undefined) {
  const due = asDate(value || null)
  if (!due) return ''
  return due.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

function pushPayload(reminder: ReminderRow) {
  const title = cleanText(reminder.title) || 'Việc cần nhớ'
  const notes = cleanText(reminder.notes)
  const time = formatDueTime(reminder.due_at)
  const timeText = time ? ` • ${time}` : ''
  return {
    title: `${categoryIcon(reminder.category)} ${title}`,
    body: notes || `Đến giờ làm việc này${timeText}. Mở TXPick để xem chi tiết.`,
    tag: `reminder-${reminder.id}`,
    url: '/reminders',
    data: { reminderId: reminder.id, category: reminder.category || 'personal' },
  }
}

async function sendPush(sub: PushSubscriptionRow, payload: Record<string, unknown>) {
  return webpush.sendNotification(
    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify(payload),
    { TTL: 60 * 60 },
  )
}

Deno.serve(async (req) => {
  if (!ALLOWED_METHODS.has(req.method)) return json({ error: 'Method not allowed' }, 405)
  if (!requireCronAuth(req)) return json({ error: 'Unauthorized reminder job' }, 401)

  const now = new Date()
  const dueBefore = now.toISOString()
  const dueAfter = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()

  try {
    configureWebPush()
    const supabase = getServiceClient()

    const { data: reminders, error: reminderError } = await supabase
      .from('reminders')
      .select('id, profile_id, title, notes, category, due_at, repeat_pattern, completed')
      .eq('completed', false)
      .lte('due_at', dueBefore)
      .gte('due_at', dueAfter)
      .order('due_at', { ascending: true })
      .limit(BATCH_LIMIT)

    if (reminderError) throw reminderError

    const due = [] as Array<{ reminder: ReminderRow; occ: { due: Date; key: string } }>
    for (const reminder of (reminders || []) as ReminderRow[]) {
      const occ = occurrenceFor(reminder, now)
      if (occ) due.push({ reminder, occ })
    }

    if (!due.length) {
      return json({ ok: true, source: 'supabase_edge_function', checked: reminders?.length || 0, due: 0, sent: 0 })
    }

    const keys = due.map((item) => item.occ.key)
    const { data: existingLogs, error: logError } = await supabase
      .from('push_notification_logs')
      .select('dedupe_key')
      .in('dedupe_key', keys)

    if (logError) throw logError

    const sentKeys = new Set((existingLogs || []).map((row: { dedupe_key: string }) => row.dedupe_key))
    const pending = due.filter((item) => !sentKeys.has(item.occ.key))
    const profileIds = [...new Set(pending.map((item) => item.reminder.profile_id))]

    if (!profileIds.length) {
      return json({ ok: true, source: 'supabase_edge_function', checked: reminders?.length || 0, due: due.length, sent: 0 })
    }

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, profile_id, endpoint, p256dh, auth, enabled')
      .in('profile_id', profileIds)
      .eq('enabled', true)

    if (subsError) throw subsError

    const subsByProfile = new Map<string, PushSubscriptionRow[]>()
    for (const sub of (subs || []) as PushSubscriptionRow[]) {
      if (!subsByProfile.has(sub.profile_id)) subsByProfile.set(sub.profile_id, [])
      subsByProfile.get(sub.profile_id)?.push(sub)
    }

    let sent = 0
    let failed = 0
    let skippedNoDevice = 0

    for (const item of pending) {
      const userSubs = subsByProfile.get(item.reminder.profile_id) || []
      if (!userSubs.length) {
        skippedNoDevice += 1
        continue
      }

      let delivered = 0
      let lastError: string | null = null

      for (const sub of userSubs) {
        try {
          await sendPush(sub, pushPayload(item.reminder))
          delivered += 1
          sent += 1
          await supabase
            .from('push_subscriptions')
            .update({ last_sent_at: now.toISOString(), last_error: null, updated_at: now.toISOString() })
            .eq('id', sub.id)
        } catch (err) {
          failed += 1
          lastError = err instanceof Error ? err.message : 'Push failed'
          const statusCode = (err as { statusCode?: number; status?: number })?.statusCode || (err as { status?: number })?.status
          const disable = statusCode === 404 || statusCode === 410
          await supabase
            .from('push_subscriptions')
            .update({ enabled: disable ? false : sub.enabled, last_error: lastError, updated_at: now.toISOString() })
            .eq('id', sub.id)
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

    return json({
      ok: true,
      source: 'supabase_edge_function',
      checked: reminders?.length || 0,
      due: due.length,
      pending: pending.length,
      sent,
      failed,
      skippedNoDevice,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to send reminders'
    return json({ ok: false, source: 'supabase_edge_function', error: message }, 500)
  }
})
