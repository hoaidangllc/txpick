import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from './Login.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { supabase } from '../lib/supabase.js'
import { authRedirectUrl } from '../lib/authRedirects.js'

export default function ForgotPassword() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl('/reset-password'),
    })

    setLoading(false)
    if (err) return setError(err.message)
    setSuccess('Password reset email sent. Please check your inbox and follow the link.')
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Forgot password</h1>
      <p className="mt-1 text-sm text-ink-500">Enter your email and TXPick will send you a secure reset link.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">{t.auth.email}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '…' : 'Send reset email'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-500 text-center">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">{t.auth.signIn}</Link>
      </p>
    </AuthLayout>
  )
}
