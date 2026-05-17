import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'ddh2755@gmail.com')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean)

function isAdmin(user) {
  return ADMIN_EMAILS.includes(String(user?.email || '').toLowerCase())
}

async function withVoiceUrls(supabase, rows) {
  const out = []
  for (const row of rows || []) {
    let voice_signed_url = null
    if (row.voice_note_url) {
      const { data } = await supabase.storage.from('feedback-voice-notes').createSignedUrl(row.voice_note_url, 60 * 30)
      voice_signed_url = data?.signedUrl || null
    }
    out.push({ ...row, voice_signed_url })
  }
  return out
}

export default async function handler(req, res) {
  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })
    if (!isAdmin(user)) return sendJson(res, 403, { error: 'Admin access only' })

    if (req.method === 'GET') {
      const status = req.query?.status || ''
      const workspace = req.query?.workspace || ''
      let query = supabase
        .from('feedback_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (status && status !== 'all') query = query.eq('status', status)
      if (workspace && workspace !== 'all') query = query.eq('workspace_type', workspace)
      const { data, error: listError } = await query
      if (listError) throw listError

      const rows = data || []
      const profileIds = [...new Set(rows.map((row) => row.profile_id).filter(Boolean))]
      let profilesById = new Map()
      if (profileIds.length) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name, business_name, type')
          .in('id', profileIds)
        if (profilesError) throw profilesError
        profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]))
      }

      const hydrated = rows.map((row) => ({ ...row, profiles: profilesById.get(row.profile_id) || null }))
      return sendJson(res, 200, { ok: true, items: await withVoiceUrls(supabase, hydrated) })
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req)
      const id = body?.id
      const status = body?.status
      const allowed = new Set(['new', 'reviewed', 'planned', 'done', 'archived'])
      if (!id || !allowed.has(status)) return sendJson(res, 400, { error: 'Invalid status update' })
      const { data, error: updateError } = await supabase
        .from('feedback_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()
      if (updateError) throw updateError
      return sendJson(res, 200, { ok: true, item: data })
    }

    return sendJson(res, 405, { error: 'Method not allowed' })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to load feedback admin' })
  }
}
