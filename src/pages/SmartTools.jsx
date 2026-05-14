import { Sparkles, Zap, AlertTriangle } from 'lucide-react'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, canUseAI, getPlan, buildDailyInsight } from '../lib/lifeStore.js'

export default function SmartTools() {
  const [planKey] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [reminders] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const usage = canUseAI(planKey)
  return <div className="container-app py-6 sm:py-8"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><Sparkles className="w-7 h-7 text-gold-600" /> Smart tools</h1><p className="text-ink-500 mt-1">AI dùng nhẹ, có giới hạn, không chatbot tự do. App vẫn chạy tốt khi tắt AI.</p></div><section className="mt-5 grid lg:grid-cols-3 gap-4"><Info title="Plan" value={getPlan(planKey).name} /><Info title="AI actions today" value={`${usage.used}/${usage.limit}`} /><Info title="Mode" value="Cost controlled" /></section><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> Smart insight preview</h2><p className="mt-2 text-sm text-ink-600">{buildDailyInsight({ reminders, expenses, bills })}</p></div><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold-600" /> Disabled by direction</h2><ul className="mt-3 text-sm text-ink-600 space-y-2"><li>Receipt/photo scan: disabled.</li><li>AI tax advice: disabled.</li><li>Unlimited AI chat: disabled.</li><li>Mileage tracking: disabled.</li><li>Complicated tax forms: disabled.</li></ul></div></div>
}
function Info({ title, value }) { return <div className="card p-5"><p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p></div> }
