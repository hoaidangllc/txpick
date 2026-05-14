import { Check, Crown, X } from 'lucide-react'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS } from '../lib/lifeStore.js'

const plans = [
  { key: 'free', name: 'Free', price: '$0', sub: 'Basic daily use', features: ['Basic reminders', 'Basic expenses', 'Today page', 'Light ads', 'Limited AI actions'], missing: ['Yearly export', 'Advanced notifications'] },
  { key: 'basic', name: 'Pro Basic', price: '$1.99/mo', sub: 'Remove ads + basic premium', features: ['No ads', 'More reminders', 'More expenses', 'More AI actions', 'Cleaner experience'], missing: ['Unlimited records'] },
  { key: 'premium', name: 'Pro Plus', price: '$4.99/mo', sub: 'Best for family + business', features: ['Unlimited reminders', 'Unlimited expenses', 'Yearly summary/export', 'Smart insights', 'Family reminders', 'Advanced notifications'], missing: [] },
]

export default function Pricing() {
  const [planKey, api] = useLocalStore(STORAGE_KEYS.plan, 'free')
  return <div className="min-h-screen bg-ink-50 py-10"><div className="container-app"><div className="text-center max-w-2xl mx-auto"><h1 className="text-4xl font-extrabold text-ink-900">Simple pricing</h1><p className="mt-3 text-ink-600">Không bán AI vô hạn. Giá rẻ, rõ giới hạn, dùng hằng ngày không đau ví.</p></div><div className="mt-8 grid lg:grid-cols-3 gap-5">{plans.map((p) => <div key={p.key} className={`card p-6 ${p.key === 'premium' ? 'ring-2 ring-brand-500' : ''}`}><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-ink-900">{p.name}</h2>{p.key !== 'free' && <Crown className="w-5 h-5 text-gold-600" />}</div><p className="mt-2 text-3xl font-extrabold text-ink-900">{p.price}</p><p className="text-sm text-ink-500">{p.sub}</p><button onClick={() => api.setValue(p.key)} className={`mt-5 w-full ${planKey === p.key ? 'btn-secondary' : 'btn-primary'}`}>{planKey === p.key ? 'Current plan' : 'Use this plan'}</button><ul className="mt-5 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-brand-600" /> {f}</li>)}{p.missing.map((f) => <li key={f} className="flex gap-2 text-ink-400"><X className="w-4 h-4" /> {f}</li>)}</ul></div>)}</div></div></div>
}
