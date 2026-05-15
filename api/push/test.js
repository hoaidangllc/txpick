import { sendPush } from '../_push.js'
import { getUserFromRequest, sendJson } from '../_supabase.js'

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
    if (!subs?.length) return sendJson(res, 404, { error: 'No active push subscription found' })

    let sent = 0
    for (const sub of subs) {
      try {
        await sendPush({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, {
          title: 'TX Life test reminder',
          body: 'Push notifications are working on this device.',
          tag: `test-${Date.now()}`,
          url: '/today',
        })
        sent += 1
      } catch (err) {
        await supabase.from('push_subscriptions').update({ last_error: err.message, updated_at: new Date().toISOString() }).eq('id', sub.id)
      }
    }
    return sendJson(res, 200, { ok: true, sent })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to send test push' })
  }
}
