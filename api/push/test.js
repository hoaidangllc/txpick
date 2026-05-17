import { sendPush } from '../_push.js'
import { getUserFromRequest, sendJson } from '../_supabase.js'

function categoryIcon(category) {
  const value = String(category || '').toLowerCase()
  if (value.includes('health') || value.includes('med')) return '💊'
  if (value.includes('bill')) return '💵'
  if (value.includes('expense') || value.includes('spend')) return '💳'
  if (value.includes('business') || value.includes('work')) return '💼'
  if (value.includes('family')) return '👨‍👩‍👧‍👦'
  return '🔔'
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function formatDueTime(value) {
  if (!value) return ''
  const due = new Date(value)
  if (Number.isNaN(due.getTime())) return ''
  return due.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

function reminderPayload(reminder) {
  if (!reminder) {
    return {
      title: '🔔 TXPick nhắc việc',
      body: 'Nhắc việc trên điện thoại đã bật. Khi tới giờ, app sẽ báo nội dung việc cần làm ở đây.',
      tag: `test-${Date.now()}`,
      url: '/today',
    }
  }

  const title = cleanText(reminder.title) || 'Việc cần nhớ'
  const notes = cleanText(reminder.notes)
  const time = formatDueTime(reminder.due_at)
  const timeText = time ? ` • ${time}` : ''

  return {
    title: `${categoryIcon(reminder.category)} ${title}`,
    body: notes || `Đến giờ làm việc này${timeText}. Mở TXPick để xem chi tiết.`,
    tag: `test-reminder-${reminder.id}-${Date.now()}`,
    url: '/reminders',
    data: { reminderId: reminder.id },
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const { data: subs, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', user.id)
      .eq('enabled', true)
    if (subError) throw subError
    if (!subs?.length) {
      return sendJson(res, 404, {
        error: 'No active push subscription found',
        code: 'no_active_push_subscription',
        userMessage: 'This phone has not saved a push subscription yet. Enable phone reminders first.',
      })
    }

    const { data: reminders } = await supabase
      .from('reminders')
      .select('id, title, notes, category, due_at, repeat_pattern, completed')
      .eq('profile_id', user.id)
      .eq('completed', false)
      .order('due_at', { ascending: true, nullsFirst: false })
      .limit(1)

    const payload = reminderPayload(reminders?.[0] || null)

    let sent = 0
    let failed = 0
    const errors = []
    for (const sub of subs) {
      try {
        await sendPush({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
        sent += 1
        await supabase.from('push_subscriptions').update({ last_sent_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }).eq('id', sub.id)
      } catch (err) {
        failed += 1
        const lastError = err.message || 'Push failed'
        errors.push(lastError)
        await supabase.from('push_subscriptions').update({ last_error: lastError, updated_at: new Date().toISOString() }).eq('id', sub.id)
      }
    }

    const logKey = `test:${user.id}:${Date.now()}`
    const { error: logError } = await supabase.from('push_notification_logs').insert({
      profile_id: user.id,
      reminder_id: reminders?.[0]?.id || null,
      dedupe_key: logKey,
      channel: 'web_push_test',
      status: sent ? 'sent' : 'failed',
      delivered_count: sent,
      error: sent ? null : (errors[0] || 'No notification delivered'),
    })

    if (logError) {
      console.warn('TXPick push test sent, but log save failed:', logError.message || logError)
    }

    if (!sent) {
      return sendJson(res, 500, {
        error: errors[0] || 'Push test failed',
        code: 'push_send_failed',
        sent,
        failed,
        subscriptionCount: subs.length,
        payloadPreview: { title: payload.title, body: payload.body },
        errors,
      })
    }

    return sendJson(res, 200, {
      ok: true,
      sent,
      failed,
      subscriptionCount: subs.length,
      payloadPreview: { title: payload.title, body: payload.body },
      message: 'Test notification sent. Lock your phone and check the notification center.',
    })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to send test push', code: 'server_error' })
  }
}
