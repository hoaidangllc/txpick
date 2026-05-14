import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const SUPABASE_CONFIGURED = Boolean(url && anonKey)

if (!SUPABASE_CONFIGURED) {
  console.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = SUPABASE_CONFIGURED
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createUnconfiguredClient()

function createUnconfiguredClient() {
  const notReady = async () => ({ data: null, error: new Error('Supabase is not configured.') })
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: notReady,
      signUp: notReady,
      signInWithOAuth: notReady,
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from() {
      const chain = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        upsert: () => chain,
        delete: () => chain,
        eq: () => chain,
        order: () => chain,
        maybeSingle: notReady,
        single: notReady,
        then: (resolve) => resolve({ data: [], error: new Error('Supabase is not configured.') }),
      }
      return chain
    },
  }
}
