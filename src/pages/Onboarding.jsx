import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, User, Users, ArrowRight } from 'lucide-react'
import { AuthLayout } from './Login.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js'

export default function Onboarding() {
  const { t } = useLang()
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [choice, setChoice] = useState('business')
  const [saving, setSaving] = useState(false)

  const options = [
    { key: 'business', icon: Briefcase, title: t.onboarding.business, hint: t.onboarding.businessHint },
    { key: 'personal', icon: User, title: t.onboarding.personal, hint: t.onboarding.personalHint },
    { key: 'both', icon: Users, title: t.onboarding.both, hint: t.onboarding.bothHint },
  ]

  const handleContinue = async () => {
    setSaving(true)
    const profile = { type: choice, onboardedAt: new Date().toISOString() }
    updateProfile(profile)
    if (SUPABASE_CONFIGURED && user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ type: choice, onboarded_at: new Date().toISOString() })
          .eq('id', user.id)
      } catch { /* fall back to local profile */ }
    }
    setSaving(false)
    if (choice === 'personal') navigate('/personal')
    else navigate('/business')
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">{t.onboarding.title}</h1>
      <p className="mt-1 text-sm text-ink-500">{t.onboarding.sub}</p>

      <div className="mt-6 space-y-3">
        {options.map((o) => {
          const Icon = o.icon
          const active = choice === o.key
          return (
            <label
              key={o.key}
              className={
                'flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ' +
                (active
                  ? 'border-brand-500 bg-brand-50/50 ring-4 ring-brand-500/10'
                  : 'border-ink-200 hover:border-ink-300')
              }
            >
              <input
                type="radio"
                name="onboarding"
                value={o.key}
                checked={active}
                onChange={() => setChoice(o.key)}
                className="sr-only"
              />
              <div
                className={
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' +
                  (active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600')
                }
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink-900">{o.title}</p>
                <p className="text-sm text-ink-500">{o.hint}</p>
              </div>
            </label>
          )
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={saving}
        className="btn-primary w-full mt-6"
      >
        {saving ? '…' : t.onboarding.continue} <ArrowRight className="w-4 h-4" />
      </button>
    </AuthLayout>
  )
}
