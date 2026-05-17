import { getUserFromRequest, sendJson } from '../_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    let endpoint = null
    try {
      endpoint = typeof req.body === 'object' ? req.body?.endpoint : null
    } catch {}

    const { data: subs, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, enabled, last_sent_at, last_error, created_at, updated_at')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (subError) throw subError

    const { data: logs } = await supabase
      .from('push_notification_logs')
      .select('status, delivered_count, error, created_at')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const total = subs?.length || 0
    const enabled = (subs || []).filter((row) => row.enabled).length
    const hasThisEndpoint = Boolean(endpoint && (subs || []).some((row) => row.endpoint === endpoint))

    return sendJson(res, 200, {
      ok: true,
      total,
      enabled,
      hasThisEndpoint,
      envReady: Boolean((process.env.VITE_WEB_PUSH_PUBLIC_KEY || process.env.WEB_PUSH_PUBLIC_KEY) && process.env.WEB_PUSH_PRIVATE_KEY),
      recentSubscriptions: (subs || []).slice(0, 3).map((row) => ({
        id: row.id,
        enabled: row.enabled,
        endpointStart: row.endpoint?.slice(0, 80) || '',
        lastSentAt: row.last_sent_at,
        lastError: row.last_error,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      recentLogs: logs || [],
    })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to check push status' })
  }
}
