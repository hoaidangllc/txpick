import { Check, Crown, X } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS } from '../lib/lifeStore.js'
import { textFor } from '../lib/uiText.js'

function plans(ui) {
  const f = ui.pricing.features
  return [
    { key: 'free', name: 'Free', price: '$0', sub: ui.pricing.basicDaily, features: [f.basicReminders, f.basicExpenses, f.todayPage, f.lightAds, f.limitedAI], missing: [f.yearlyExport, f.advancedNotifications] },
    { key: 'basic', name: 'Pro Basic', price: '$1.99/mo', sub: ui.pricing.removeAds, features: [f.noAds, f.moreReminders, f.moreExpenses, f.moreAI, f.cleaner], missing: [f.unlimitedRecords] },
    { key: 'premium', name: 'Pro Plus', price: '$4.99/mo', sub: ui.pricing.best, features: [f.unlimitedReminders, f.unlimitedExpenses, f.yearlySummary, f.smartInsights, f.familyReminders, f.advancedNotifications], missing: [] },
  ]
}

export default function Pricing() {
  const { lang } = useLang()
  const ui = textFor(lang)
  const [planKey, api] = useLocalStore(STORAGE_KEYS.plan, 'free')
  return <div className="min-h-screen bg-ink-50 py-10"><div className="container-app"><div className="text-center max-w-2xl mx-auto"><h1 className="text-4xl font-extrabold text-ink-900">{ui.pricing.title}</h1><p className="mt-3 text-ink-600">{ui.pricing.subtitle}</p></div><div className="mt-8 grid lg:grid-cols-3 gap-5">{plans(ui).map((p) => <div key={p.key} className={`card p-6 ${p.key === 'premium' ? 'ring-2 ring-brand-500' : ''}`}><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-ink-900">{p.name}</h2>{p.key !== 'free' && <Crown className="w-5 h-5 text-gold-600" />}</div><p className="mt-2 text-3xl font-extrabold text-ink-900">{p.price}</p><p className="text-sm text-ink-500">{p.sub}</p><button onClick={() => api.setValue(p.key)} className={`mt-5 w-full ${planKey === p.key ? 'btn-secondary' : 'btn-primary'}`}>{planKey === p.key ? ui.common.currentPlan : ui.common.useThisPlan}</button><ul className="mt-5 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-brand-600" /> {f}</li>)}{p.missing.map((f) => <li key={f} className="flex gap-2 text-ink-400"><X className="w-4 h-4" /> {f}</li>)}</ul></div>)}</div></div></div>
}
