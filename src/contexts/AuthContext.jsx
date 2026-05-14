import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({ user: null, loading: true, signOut: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(() => {
    try {
      const p = localStorage.getItem('txpick_profile')
      return p ? JSON.parse(p) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const updateProfile = (next) => {
    setProfile(next)
    try { localStorage.setItem('txpick_profile', JSON.stringify(next)) } catch {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    try { localStorage.removeItem('txpick_profile') } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, profile, updateProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
