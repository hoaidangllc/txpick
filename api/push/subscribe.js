import { cleanSubscription } from '../_push.js'
import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const body = await readJsonBody(req)
    const sub = cleanSubscription(body?.subscription)
    if (!sub) return sendJson(res, 400, { error: 'Invalid push subscription' })

    const ua = req.headers['user-agent'] || ''
    const { error: upsertError } = await supabase.from('push_subscriptions').upsert({
      profile_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: ua,
      enabled: true,
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

    if (upsertError) throw upsertError
    return sendJson(res, 200, { ok: true })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to save push subscription' })
  }
}
