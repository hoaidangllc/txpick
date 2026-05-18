import { Megaphone } from 'lucide-react'
import { canShowAds, getPlanFromProfile } from '../../lib/plans/featureGate.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useLang } from '../../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    label: 'TXPick tip',
    text: 'Plus sẽ có trải nghiệm gọn hơn và không quảng cáo khi ra mắt.'
  },
  en: {
    label: 'TXPick tip',
    text: 'Plus will offer a cleaner, ad-free experience when it launches.'
  },
}

export default function AdPlaceholder({ className = '' }) {
  const { profile } = useAuth()
  const { lang } = useLang()
  const planKey = getPlanFromProfile(profile)
  const c = copy[lang] || copy.en

  if (!canShowAds(planKey)) return null
  if (import.meta.env.VITE_SHOW_AD_PREVIEW !== 'true') return null

  return (
    <aside className={`rounded-3xl border border-dashed border-ink-200 bg-white/70 p-4 text-sm text-ink-500 ${className}`} aria-label={c.label}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-8 w-8 rounded-2xl bg-ink-50 text-ink-500 grid place-items-center shrink-0">
          <Megaphone className="h-4 w-4" />
        </span>
        <div>
          <p className="font-bold text-ink-700">{c.label}</p>
          <p className="mt-0.5 leading-relaxed">{c.text}</p>
        </div>
      </div>
    </aside>
  )
}
