import { Sparkles, Zap, AlertTriangle } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, canUseAI, getPlan, buildDailyInsight } from '../lib/lifeStore.js'
import { textFor } from '../lib/uiText.js'

export default function SmartTools() {
  const { lang } = useLang()
  const ui = textFor(lang)
  const [planKey] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [reminders] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const usage = canUseAI(planKey)
  return <div className="container-app py-6 sm:py-8"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><Sparkles className="w-7 h-7 text-gold-600" /> {ui.smart.title}</h1><p className="text-ink-500 mt-1">{ui.smart.subtitle}</p></div><section className="mt-5 grid lg:grid-cols-3 gap-4"><Info title={ui.common.plan} value={getPlan(planKey).name} /><Info title={ui.smart.aiActions} value={`${usage.used}/${usage.limit}`} /><Info title={ui.smart.mode} value={ui.smart.costControlled} /></section><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> {ui.smart.insight}</h2><p className="mt-2 text-sm text-ink-600">{buildDailyInsight({ reminders, expenses, bills, lang })}</p></div><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold-600" /> {ui.smart.disabledTitle}</h2><ul className="mt-3 text-sm text-ink-600 space-y-2">{ui.smart.disabled.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
}
function Info({ title, value }) { return <div className="card p-5"><p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p></div> }
