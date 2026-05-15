import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })
    const body = await readJsonBody(req)
    const endpoint = body?.endpoint
    if (!endpoint) return sendJson(res, 400, { error: 'Missing endpoint' })
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .eq('endpoint', endpoint)
    if (updateError) throw updateError
    return sendJson(res, 200, { ok: true })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to disable push subscription' })
  }
}
