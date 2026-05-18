import { supabase, SUPABASE_CONFIGURED } from './supabase.js'

const STORAGE_KEY = 'txpick_analytics_queue_v1'

function safeReadQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function safeWriteQueue(queue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-50)))
  } catch {
    // localStorage can be unavailable in private mode. Analytics must never break the app.
  }
}

export function queueAnalyticsEvent(eventName, payload = {}) {
  if (!eventName) return
  const queue = safeReadQueue()
  queue.push({ event_name: eventName, payload, created_at: new Date().toISOString() })
  safeWriteQueue(queue)
}

export async function trackEvent(userId, eventName, payload = {}) {
  if (!eventName) return
  const event = {
    profile_id: userId || null,
    event_name: eventName,
    payload,
    page_path: typeof window !== 'undefined' ? window.location.pathname : null,
    created_at: new Date().toISOString(),
  }

  if (!SUPABASE_CONFIGURED || !userId) {
    queueAnalyticsEvent(eventName, payload)
    return
  }

  try {
    const { error } = await supabase.from('app_events').insert(event)
    if (error) throw error
  } catch {
    queueAnalyticsEvent(eventName, payload)
  }
}

export async function flushQueuedAnalytics(userId) {
  if (!SUPABASE_CONFIGURED || !userId) return
  const queue = safeReadQueue()
  if (!queue.length) return
  try {
    const rows = queue.map((item) => ({
      profile_id: userId,
      event_name: item.event_name,
      payload: item.payload || {},
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      created_at: item.created_at || new Date().toISOString(),
    }))
    const { error } = await supabase.from('app_events').insert(rows)
    if (error) throw error
    safeWriteQueue([])
  } catch {
    // Keep queue for the next app open.
  }
}
