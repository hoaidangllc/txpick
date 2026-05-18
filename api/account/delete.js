import { getServiceClient, getUserFromRequest, readJsonBody, sendJson } from '../_supabase.js'

const USER_DATA_TABLES = [
  ['push_notification_logs', 'profile_id'],
  ['push_subscriptions', 'profile_id'],
  ['feedback_requests', 'profile_id'],
  ['daily_summaries', 'profile_id'],
  ['expenses', 'profile_id'],
  ['bills', 'profile_id'],
  ['reminders', 'profile_id'],
  ['biz_expenses', 'user_id'],
  ['biz_recurring_bills', 'user_id'],
  ['biz_workers_1099', 'user_id'],
  ['biz_workers_w2', 'user_id'],
  ['business_info', 'user_id'],
  ['profiles', 'id'],
]

async function deleteRowsIfTableExists(supabase, table, column, userId) {
  const { error } = await supabase.from(table).delete().eq(column, userId)
  if (!error) return { table, ok: true }
  const message = error.message || ''
  const missing = message.includes('does not exist') || error.code === '42P01' || error.code === '42703'
  if (missing) return { table, ok: true, skipped: true, reason: 'missing_table_or_column' }
  throw error
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const { user, error } = await getUserFromRequest(req)
    if (error) return sendJson(res, 401, { error })

    const body = await readJsonBody(req)
    if (body?.confirm !== 'DELETE') {
      return sendJson(res, 400, { error: 'Confirmation text must be DELETE', code: 'confirm_required' })
    }

    const supabase = getServiceClient()
    const results = []
    for (const [table, column] of USER_DATA_TABLES) {
      results.push(await deleteRowsIfTableExists(supabase, table, column, user.id))
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
    if (authError) throw authError

    return sendJson(res, 200, { ok: true, deletedUserId: user.id, results })
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Unable to delete account', code: 'delete_failed' })
  }
}
