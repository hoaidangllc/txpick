import { Sparkles, Zap, ShieldCheck, Bell, CalendarCheck, FileText, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, canUseAI, buildDailyInsight, planLabel } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Gợi ý hôm nay',
    sub: 'Một câu ngắn để bạn biết hôm nay cần chú ý gì. AI chỉ dùng nhẹ và có giới hạn, để app luôn nhanh, rẻ và dễ kiểm soát.',
    plan: 'Gói hiện tại',
    actions: 'Lượt gợi ý hôm nay',
    mode: 'Cách hoạt động',
    controlled: 'Tiết kiệm chi phí',
    preview: 'Gợi ý hiện tại',
    settings: 'Cài đặt gói',
    settingsSub: 'Đổi gói để thử mức giới hạn khác. Có thể đổi lại bất cứ lúc nào.',
    seePricing: 'Xem bảng giá',
    howTitle: 'AI trong app này dùng để làm gì?',
    h1: 'Hiểu câu nhắc tự nhiên',
    h1Text: 'Ví dụ: "nhắc tôi trả tiền điện ngày mai lúc 9 giờ tối". App tự nhận tiêu đề, ngày, giờ và phân loại.',
    h2: 'Gợi ý việc còn thiếu',
    h2Text: 'Nhắc bạn nếu chưa nhập chi tiêu tháng này, có hóa đơn sắp tới, hoặc còn việc chưa làm trong hôm nay.',
    h3: 'Tổng kết ngắn',
    h3Text: 'Tóm tắt nhanh trong ngày và trong tháng để mở app là biết cần làm gì tiếp theo.',
    noteTitle: 'Giới hạn rõ ràng',
    note: 'TxPick không bán chatbot vô hạn, không tư vấn thuế, không scan hình hóa đơn. Những phần đó dễ tốn tiền và dễ rối, nên chưa đưa vào bản này.',
    free: 'Miễn phí',
    basic: 'Pro Cơ Bản — $1.99/tháng',
    premium: 'Pro Plus — $4.99/tháng',
  },
  en: {
    title: 'Daily insight',
    sub: 'A short note about what to pay attention to today. AI stays light and limited so the app remains fast, affordable, and predictable.',
    plan: 'Current plan',
    actions: 'Insight actions today',
    mode: 'Mode',
    controlled: 'Cost controlled',
    preview: 'Current insight',
    settings: 'Plan settings',
    settingsSub: 'Switch plans to try different limits. You can switch back anytime.',
    seePricing: 'See pricing',
    howTitle: 'How AI is used here',
    h1: 'Understand natural reminders',
    h1Text: 'Example: "remind me to pay the electric bill tomorrow at 9 PM." The app detects title, date, time, and category.',
    h2: 'Spot what may be missing',
    h2Text: 'It can point out missing monthly expenses, bills coming due, or unfinished reminders for today.',
    h3: 'Short summaries',
    h3Text: 'A quick daily and monthly summary so opening the app immediately tells you what to do next.',
    noteTitle: 'Clear limits',
    note: 'TxPick does not include unlimited chatbot use, tax advice, or receipt photo scanning in this version. Those features can become costly and confusing.',
    free: 'Free',
    basic: 'Pro Basic — $1.99/mo',
    premium: 'Pro Plus — $4.99/mo',
  },
}

export default function SmartTools() {
  const { lang } = useLang()
  const c = copy[lang]
  const [planKey, planApi] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [reminders] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const usage = canUseAI(planKey)

  return (
    <div className="container-app py-6 sm:py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-gold-600" /> {c.title}
        </h1>
        <p className="text-ink-500 mt-1 max-w-3xl">{c.sub}</p>
      </div>

      <section className="mt-5 grid sm:grid-cols-3 gap-4">
        <Info title={c.plan} value={planLabel(planKey, lang)} icon={Crown} />
        <Info title={c.actions} value={`${usage.used}/${usage.limit}`} icon={Zap} />
        <Info title={c.mode} value={c.controlled} icon={ShieldCheck} />
      </section>

      <div className="mt-5 card p-5">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-600" /> {c.preview}
        </h2>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed">
          {buildDailyInsight({ reminders, expenses, bills, lang })}
        </p>
      </div>

      <div className="mt-5 card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-bold text-ink-900">{c.settings}</h2>
            <p className="text-sm text-ink-500 mt-1">{c.settingsSub}</p>
          </div>
          <Link to="/pricing" className="btn-secondary text-sm">{c.seePricing}</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          {[{ key: 'free', label: c.free }, { key: 'basic', label: c.basic }, { key: 'premium', label: c.premium }].map((p) => (
            <button
              key={p.key}
              onClick={() => planApi.setValue(p.key)}
              className={`px-3 py-3 rounded-xl border text-left transition ${
                planKey === p.key
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 card p-5">
        <h2 className="font-bold text-ink-900">{c.howTitle}</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
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

function Info({ title, value, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</p>
        {Icon && <Icon className="w-4 h-4 text-ink-400" />}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink-900">{value}</p>
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
