import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Stub mode: if env vars aren't set, we expose a friendly mock so the UI keeps
// working in dev. Swap to real credentials in .env to enable cloud auth.
export const SUPABASE_CONFIGURED = Boolean(url && anonKey)

export const supabase = SUPABASE_CONFIGURED
  ? createClient(url, anonKey)
  : createMockClient()

function createMockClient() {
  // Tiny in-memory mock used until you wire up real Supabase credentials.
  const listeners = new Set()
  let session = null
  try {
    const cached = localStorage.getItem('txpick_mock_session')
    if (cached) session = JSON.parse(cached)
  } catch {}

  const persist = () => {
    try {
      if (session) localStorage.setItem('txpick_mock_session', JSON.stringify(session))
      else localStorage.removeItem('txpick_mock_session')
    } catch {}
    listeners.forEach((cb) => cb('SIGNED_IN', session))
  }

  return {
    auth: {
      async getSession() {
        return { data: { session }, error: null }
      },
      async signInWithPassword({ email }) {
        session = { user: { id: 'mock-' + email, email }, access_token: 'mock' }
        persist()
        return { data: { session }, error: null }
      },
      async signUp({ email }) {
        session = { user: { id: 'mock-' + email, email }, access_token: 'mock' }
        persist()
        return { data: { session }, error: null }
      },
      async signInWithOAuth() {
        session = { user: { id: 'mock-google', email: 'local@txpick.com' }, access_token: 'mock' }
        persist()
        return { data: {}, error: null }
      },
      async signOut() {
        session = null
        persist()
        return { error: null }
      },
      onAuthStateChange(cb) {
        listeners.add(cb)
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
      },
    },
    from() {
      // No-op chain for now; replace with real Supabase tables in production.
      const chain = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        order: () => chain,
        single: () => Promise.resolve({ data: null, error: null }),
        then: (resolve) => resolve({ data: [], error: null }),
      }
      return chain
    },
  }
}
