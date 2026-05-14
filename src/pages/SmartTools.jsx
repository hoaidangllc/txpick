import { Sparkles, Zap, AlertTriangle } from 'lucide-react'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, canUseAI, buildDailyInsight, planLabel } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: { title: 'Gợi ý thông minh', sub: 'AI chỉ dùng nhẹ, có giới hạn. App vẫn chạy tốt khi không dùng AI.', plan: 'Gói hiện tại', actions: 'Lượt AI hôm nay', mode: 'Chế độ', controlled: 'Kiểm soát chi phí', preview: 'Xem trước gợi ý', disabled: 'Những phần đang tắt', d1: 'Scan hình hóa đơn: đã tắt.', d2: 'Tư vấn thuế bằng AI: đã tắt.', d3: 'Chatbot AI tự do: đã tắt.', d4: 'Theo dõi mileage: đã tắt.', d5: 'Form thuế phức tạp: đã tắt.' },
  en: { title: 'Smart tools', sub: 'AI is light and limited. The app still works well without AI.', plan: 'Plan', actions: 'AI actions today', mode: 'Mode', controlled: 'Cost controlled', preview: 'Smart insight preview', disabled: 'Disabled by direction', d1: 'Receipt/photo scan: disabled.', d2: 'AI tax advice: disabled.', d3: 'Unlimited AI chat: disabled.', d4: 'Mileage tracking: disabled.', d5: 'Complicated tax forms: disabled.' },
}

export default function SmartTools() {
  const { lang } = useLang()
  const c = copy[lang]
  const [planKey] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [reminders] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const usage = canUseAI(planKey)
  return <div className="container-app py-6 sm:py-8"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><Sparkles className="w-7 h-7 text-gold-600" /> {c.title}</h1><p className="text-ink-500 mt-1">{c.sub}</p></div><section className="mt-5 grid lg:grid-cols-3 gap-4"><Info title={c.plan} value={planLabel(planKey, lang)} /><Info title={c.actions} value={`${usage.used}/${usage.limit}`} /><Info title={c.mode} value={c.controlled} /></section><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> {c.preview}</h2><p className="mt-2 text-sm text-ink-600">{buildDailyInsight({ reminders, expenses, bills, lang })}</p></div><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold-600" /> {c.disabled}</h2><ul className="mt-3 text-sm text-ink-600 space-y-2"><li>{c.d1}</li><li>{c.d2}</li><li>{c.d3}</li><li>{c.d4}</li><li>{c.d5}</li></ul></div></div>
}
function Info({ title, value }) { return <div className="card p-5"><p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p></div> }
