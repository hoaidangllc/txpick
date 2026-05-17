import { createClient } from '@supabase/supabase-js'

export function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { user: null, error: 'Missing auth token' }
  const supabase = getServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return { user: null, error: 'Invalid auth token' }
  return { user: data.user, supabase }
}

export function requireCronAuth(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const authHeader = req.headers.authorization || req.headers.Authorization || ''
  const cronHeader = req.headers['x-cron-secret'] || req.headers['X-Cron-Secret'] || ''
  return authHeader === `Bearer ${secret}` || cronHeader === secret
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}') } catch { return {} }
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') } catch { return {} }
}
