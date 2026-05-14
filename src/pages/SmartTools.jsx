import { Sparkles, Zap, ShieldCheck, Bell, CalendarCheck, FileText } from 'lucide-react'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, canUseAI, buildDailyInsight, planLabel } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Gợi ý hôm nay',
    sub: 'Gợi ý ngắn để bạn biết hôm nay cần chú ý gì. AI chỉ dùng nhẹ và có giới hạn để app luôn rẻ, nhanh, dễ kiểm soát.',
    plan: 'Gói hiện tại', actions: 'Lượt gợi ý hôm nay', mode: 'Cách hoạt động', controlled: 'Tiết kiệm chi phí', preview: 'Gợi ý hiện tại',
    howTitle: 'AI trong app này dùng để làm gì?',
    h1: 'Hiểu câu nhắc tự nhiên', h1Text: 'Ví dụ: “nhắc tôi trả tiền điện ngày mai 9 giờ tối”. App sẽ tự tách tiêu đề, ngày, giờ và loại việc.',
    h2: 'Gợi ý việc còn thiếu', h2Text: 'Nhắc bạn nếu chưa nhập chi tiêu tháng này, có hóa đơn sắp tới, hoặc còn việc chưa làm trong hôm nay.',
    h3: 'Tổng kết ngắn', h3Text: 'Tóm tắt nhanh trong ngày/tháng để bạn mở app là biết cần làm gì tiếp theo.',
    noteTitle: 'Giới hạn rõ ràng',
    note: 'TxPick không bán chatbot vô hạn, không tư vấn thuế và không đọc hình hóa đơn. Những phần đó dễ tốn tiền, dễ rối, nên chưa đưa vào bản này.',
  },
  en: {
    title: 'Daily insights',
    sub: 'Short, useful guidance for what needs attention today. AI is light and limited so the app stays affordable and reliable.',
    plan: 'Current plan', actions: 'Insight actions today', mode: 'Mode', controlled: 'Cost controlled', preview: 'Current insight',
    howTitle: 'How AI is used here',
    h1: 'Understand natural reminders', h1Text: 'Example: “remind me to pay the electric bill tomorrow at 9 PM.” The app can detect title, date, time, and category.',
    h2: 'Suggest what may be missing', h2Text: 'It can point out missing monthly expenses, upcoming bills, or unfinished reminders for today.',
    h3: 'Short summaries', h3Text: 'A quick daily/monthly summary so opening the app immediately tells you what to do next.',
    noteTitle: 'Clear limits',
    note: 'TxPick does not include unlimited chatbot use, tax advice, or receipt photo scanning in this version. Those features can become costly and complicated.',
  },
}

export default function SmartTools() {
  const { lang } = useLang()
  const c = copy[lang]
  const [planKey] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [reminders] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const usage = canUseAI(planKey)
  return <div className="container-app py-6 sm:py-8"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><Sparkles className="w-7 h-7 text-gold-600" /> {c.title}</h1><p className="text-ink-500 mt-1 max-w-3xl">{c.sub}</p></div><section className="mt-5 grid lg:grid-cols-3 gap-4"><Info title={c.plan} value={planLabel(planKey, lang)} /><Info title={c.actions} value={`${usage.used}/${usage.limit}`} /><Info title={c.mode} value={c.controlled} /></section><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> {c.preview}</h2><p className="mt-2 text-sm text-ink-600">{buildDailyInsight({ reminders, expenses, bills, lang })}</p></div><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900">{c.howTitle}</h2><div className="mt-4 grid md:grid-cols-3 gap-3"><Feature icon={Bell} title={c.h1} text={c.h1Text} /><Feature icon={CalendarCheck} title={c.h2} text={c.h2Text} /><Feature icon={FileText} title={c.h3} text={c.h3Text} /></div></div><div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-ink-700"><div className="flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-brand-700 mt-0.5" /><div><p className="font-bold text-ink-900">{c.noteTitle}</p><p className="mt-1">{c.note}</p></div></div></div></div>
}
function Info({ title, value }) { return <div className="card p-5"><p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p></div> }
function Feature({ icon: Icon, title, text }) { return <div className="rounded-2xl border border-ink-100 bg-white p-4"><div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon className="w-4 h-4" /></div><p className="mt-3 font-bold text-ink-900">{title}</p><p className="mt-1 text-sm text-ink-500">{text}</p></div> }
