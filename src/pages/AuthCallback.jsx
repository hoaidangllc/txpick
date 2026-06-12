import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './Login.jsx'
import { supabase } from '../lib/supabase.js'
import { getProfile } from '../lib/db.js'
import { nextAppRoute } from '../lib/authRedirects.js'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function finishAuth() {
      setError('')
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const type = url.searchParams.get('type')

      if (type === 'recovery') {
        navigate('/reset-password', { replace: true })
        return
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) setError(exchangeError.message)
          return
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        if (!cancelled) setError(sessionError.message)
        return
      }

      const user = data?.session?.user
      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      const profile = await getProfile(user.id)
      if (!cancelled) navigate(nextAppRoute(profile), { replace: true })
    }

    finishAuth()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Finishing sign in…</h1>
      <p className="mt-1 text-sm text-ink-500">TXPick is confirming your email and preparing your session.</p>
      {error && (
        <div className="mt-5 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
          <div className="mt-3">
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to login</Link>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
