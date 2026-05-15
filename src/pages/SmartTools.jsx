import { Sparkles, Bell, CalendarCheck, FileText, ShieldCheck } from 'lucide-react'
import { buildDailyInsight } from '../lib/lifeStore.js'
import { billsDb, expensesDb, remindersDb, useRemoteCollection } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Gợi ý hôm nay',
    sub: 'Một câu ngắn để bạn biết hôm nay cần chú ý gì. AI chỉ dùng nhẹ — hiểu câu nhắc, gợi ý ngắn và tóm tắt. Không chat tự do, không tư vấn thuế.',
    preview: 'Tóm tắt hôm nay',
    cached: 'Dựa trên dữ liệu bạn đã nhập',
    howTitle: 'AI trong app này làm gì',
    h1: 'Hiểu câu nhắc tự nhiên',
    h1Text: 'Ví dụ: "nhắc tôi trả tiền điện ngày mai lúc 9 giờ tối". App tự nhận tiêu đề, ngày, giờ và phân loại.',
    h2: 'Nhắc việc còn thiếu',
    h2Text: 'Nhắc nhẹ khi có hóa đơn sắp tới hạn, chi tiêu chưa nhập, hoặc còn việc trong hôm nay.',
    h3: 'Tóm tắt ngắn',
    h3Text: 'Một câu trong ngày và một câu trong tháng — đủ để mở app là biết làm gì tiếp.',
    noteTitle: 'Giới hạn rõ ràng',
    note: 'TX Life giữ AI thật nhẹ: hiểu câu nhắc, gợi ý ngắn và tóm tắt. Không scan hình, không chatbot, không tư vấn thuế.',
  },
  en: {
    title: 'Today insight',
    sub: 'A short note about what to pay attention to today. Light AI only — natural reminder parsing, short hints, and quick summaries. No open chat, no tax advice.',
    preview: 'Today summary',
    cached: 'Based on the data you have entered',
    howTitle: 'How AI is used here',
    h1: 'Understand natural reminders',
    h1Text: 'Example: "remind me to pay the electric bill tomorrow at 9 PM." The app detects title, date, time, and category.',
    h2: 'Spot what is missing',
    h2Text: 'A gentle nudge when a bill is coming due, an expense is unlogged, or a task is still open today.',
    h3: 'Short summaries',
    h3Text: 'One sentence for the day, one for the month — enough to know what to do next when you open the app.',
    noteTitle: 'Clear limits',
    note: 'TX Life keeps AI light: natural reminders, short hints, and summaries. No receipt scanning, no chatbot, no tax advice.',
  },
}

export default function SmartTools() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [reminders] = useRemoteCollection(user?.id, remindersDb)
  const [expenses] = useRemoteCollection(user?.id, expensesDb)
  const [bills] = useRemoteCollection(user?.id, billsDb)

  return (
    <div className="container-app py-6 sm:py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-gold-600" /> {c.title}
        </h1>
        <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
      </div>

      <section className="mt-5 card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-ink-900">{c.preview}</h2>
              <span className="text-xs text-ink-400">{c.cached}</span>
            </div>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">
              {buildDailyInsight({ reminders, expenses, bills, lang })}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 card p-4 sm:p-5">
        <h2 className="font-bold text-ink-900">{c.howTitle}</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <Feature icon={Bell} title={c.h1} text={c.h1Text} />
          <Feature icon={CalendarCheck} title={c.h2} text={c.h2Text} />
          <Feature icon={FileText} title={c.h3} text={c.h3Text} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-ink-700">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-700 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-ink-900">{c.noteTitle}</p>
            <p className="mt-1">{c.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <p className="mt-3 font-bold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  )
}
