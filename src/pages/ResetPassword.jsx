import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './Login.jsx'
import { supabase } from '../lib/supabase.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function prepareRecoverySession() {
      setError('')
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (err) setError(err.message)
        else window.history.replaceState({}, document.title, '/reset-password')
      }

      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      if (!data?.session) setError('Reset link is invalid or expired. Please request a new password reset email.')
      setReady(Boolean(data?.session))
    }

    prepareRecoverySession()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) return setError(err.message)
    setSuccess('Password updated successfully. Redirecting to login...')
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    }, 900)
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Reset password</h1>
      <p className="mt-1 text-sm text-ink-500">Create a new password for your TXPick account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">New password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className="input pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={!ready}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 my-auto text-ink-400 hover:text-ink-700" aria-label="Toggle password">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type={showPw ? 'text' : 'password'}
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            disabled={!ready}
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading || !ready}>
          {loading ? '…' : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-500 text-center">
        Need another link?{' '}
        <Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline">Send reset email again</Link>
      </p>
    </AuthLayout>
  )
}
