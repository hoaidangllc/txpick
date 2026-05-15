import { sendJson } from '../_supabase.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY || process.env.VITE_WEB_PUSH_PUBLIC_KEY || ''
  if (!publicKey) return sendJson(res, 404, { error: 'Phone reminders are not configured yet.' })
  return sendJson(res, 200, { publicKey })
}
