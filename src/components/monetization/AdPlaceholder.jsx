import { Megaphone } from 'lucide-react'
import { canShowAds, getPlanFromProfile } from '../../lib/plans/featureGate.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useLang } from '../../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    label: 'Beta ad slot',
    text: 'Chỗ quảng cáo nhẹ cho gói Free. Hiện tại đang tắt quảng cáo thật trong public beta.',
  },
  en: {
    label: 'Beta ad slot',
    text: 'Light ad placement for Free. Real ads are currently off during public beta.',
  },
}

export default function AdPlaceholder({ className = '' }) {
  const { profile } = useAuth()
  const { lang } = useLang()
  const planKey = getPlanFromProfile(profile)
  const c = copy[lang] || copy.en

  if (!canShowAds(planKey)) return null

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
