import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

const STALE_DAYS = 90

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const body = await readJsonBody(req)
    const keepEndpoint = body?.keepEndpoint || null
    const staleBefore = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString()

    let query = supabase
      .from('push_subscriptions')
      .update({ enabled: false, last_error: 'Disabled by device refresh cleanup', updated_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .or(`enabled.eq.false,last_error.not.is.null,updated_at.lt.${staleBefore}`)

    if (keepEndpoint) query = query.neq('endpoint', keepEndpoint)

    const { error: cleanupError } = await query
    if (cleanupError) throw cleanupError

    return sendJson(res, 200, { ok: true, staleDays: STALE_DAYS })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to clean stale push subscriptions' })
  }
}
