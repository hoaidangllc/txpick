import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const { user, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const body = await readJsonBody(req)
    const input = String(body?.input || '').trim()
    if (!input) return sendJson(res, 400, { error: 'Missing input', code: 'missing_input' })

    // Production-safe placeholder: server route exists, auth is protected,
    // but AI is intentionally disabled until OPENAI_API_KEY + token limits are ready.
    // This prevents a public beta from accidentally burning tokens.
    return sendJson(res, 503, {
      ok: false,
      code: 'ai_not_enabled',
      error: 'AI fallback is not enabled yet. TXPick is using local Smart Assistant parsing.',
      userId: user.id,
    })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to parse with assistant', code: 'server_error' })
  }
}
