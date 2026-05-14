import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getProfile, upsertProfile } from '../lib/db.js'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => null,
  updateProfile: async () => null,
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (nextUser) => {
    if (!nextUser?.id) {
      setProfile(null)
      return null
    }

    try {
      const row = await getProfile(nextUser.id)
      setProfile(row)
      return row
    } catch (err) {
      console.error('Failed to load profile:', err)
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      setLoading(true)

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) console.error('Failed to restore session:', error)
        if (cancelled) return

        const nextUser = data?.session?.user ?? null
        setUser(nextUser)

        if (nextUser?.id) await loadProfile(nextUser)
        else setProfile(null)
      } catch (err) {
        console.error('Auth init failed:', err)
        if (!cancelled) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (!nextUser?.id) {
        setProfile(null)
        setLoading(false)
        return
      }

      setTimeout(() => {
        loadProfile(nextUser).finally(() => setLoading(false))
      }, 0)
    })

    return () => {
      cancelled = true
      data?.subscription?.unsubscribe?.()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user])

  const updateProfile = useCallback(async (patch) => {
    if (!user) return null

    const next = await upsertProfile(user, {
      ...(profile || {}),
      ...patch,
    })

    setProfile(next)
    return next
  }, [profile, user])

  const signOut = async () => {
    setLoading(true)

    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, refreshProfile, updateProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
