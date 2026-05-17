import { getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'
import { sendFeedbackEmail } from './_email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const { user, supabase, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const body = await readJsonBody(req)
    const feedbackId = body?.feedback_id || body?.feedbackId
    if (!feedbackId) return sendJson(res, 400, { error: 'Missing feedback id' })

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_requests')
      .select('*')
      .eq('id', feedbackId)
      .eq('profile_id', user.id)
      .maybeSingle()
    if (feedbackError) throw feedbackError
    if (!feedback) return sendJson(res, 404, { error: 'Feedback not found' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, type, business_name')
      .eq('id', user.id)
      .maybeSingle()

    const result = await sendFeedbackEmail(feedback, profile || { email: user.email })
    await supabase
      .from('feedback_requests')
      .update({ email_notified_at: result.sent ? new Date().toISOString() : null, email_error: result.skipped ? result.reason : null, updated_at: new Date().toISOString() })
      .eq('id', feedback.id)

    return sendJson(res, 200, { ok: true, email: result })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to notify admin' })
  }
}
