import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout, GoogleIcon } from './Login.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js'

export default function Signup() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (err) return setError(err.message)
    navigate('/onboarding')
  }

  const handleGoogle = async () => {
    if (!SUPABASE_CONFIGURED) {
      await supabase.auth.signInWithOAuth({ provider: 'google' })
      return navigate('/onboarding')
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/today' },
    })
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">{t.auth.signupTitle}</h1>
      <p className="mt-1 text-sm text-ink-500">{t.auth.signupSub}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">{t.auth.email}</label>
          <input id="email" type="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">{t.auth.password}</label>
          <div className="relative">
            <input id="password" type={showPw ? 'text' : 'password'} className="input pr-11"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              minLength={6} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 my-auto text-ink-400 hover:text-ink-700">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '…' : t.auth.signUp}
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
        {t.auth.haveAccount}{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">{t.auth.signIn}</Link>
      </p>
    </AuthLayout>
  )
}
