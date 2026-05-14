import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js'

export default function Login() {
  const { t } = useLang()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectAfterLogin = () => {
    const from = location.state?.from?.pathname
    if (from) return navigate(from, { replace: true })
    if (profile?.type === 'business') return navigate('/business', { replace: true })
    if (profile?.type === 'personal') return navigate('/personal', { replace: true })
    navigate('/onboarding', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) return setError(err.message)
    redirectAfterLogin()
  }

  const handleGoogle = async () => {
    setError('')
    if (!SUPABASE_CONFIGURED) {
      // Mock mode: just create a session and continue.
      await supabase.auth.signInWithOAuth({ provider: 'google' })
      return redirectAfterLogin()
    }
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/onboarding' },
    })
    if (err) setError(err.message)
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">{t.auth.loginTitle}</h1>
      <p className="mt-1 text-sm text-ink-500">{t.taglineMain}</p>

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
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">{t.auth.password}</label>
            <Link to="#" className="text-xs font-semibold text-brand-700 hover:underline">{t.auth.forgot}</Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className="input pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 my-auto text-ink-400 hover:text-ink-700" aria-label="Toggle password">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '…' : t.auth.signIn}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="flex-1 h-px bg-ink-200" />
        <span>{t.auth.orContinueWith}</span>
        <span className="flex-1 h-px bg-ink-200" />
      </div>

      <button type="button" onClick={handleGoogle} className="btn-secondary w-full">
        <GoogleIcon /> {t.auth.google}
      </button>

      <p className="mt-6 text-sm text-ink-500 text-center">
        {t.auth.noAccount}{' '}
        <Link to="/signup" className="font-semibold text-brand-700 hover:underline">{t.auth.signUp}</Link>
      </p>
    </AuthLayout>
  )
}

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <header className="container-app flex items-center justify-between h-16">
        <Link to="/"><Logo /></Link>
        <LanguageToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="card w-full max-w-md p-7 sm:p-8">{children}</div>
      </main>
    </div>
  )
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 2.9l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8.9 20-20 0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2A12 12 0 0 1 12.7 28l-6.5 5C9.4 39.5 16.1 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.3 5.2c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  )
}
