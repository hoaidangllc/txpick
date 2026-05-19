import { ArrowRight, Bell, Receipt, Sparkles, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

const copy = {
  vi: {
    title: 'Bắt đầu trong 30 giây',
    sub: 'Thêm 1 việc, 1 hóa đơn hoặc 1 chi tiêu để TXPick bắt đầu giúp bạn mỗi ngày.',
    reminder: 'Tạo nhắc việc đầu tiên',
    bill: 'Thêm hóa đơn sắp tới',
    expense: 'Ghi chi tiêu đầu tiên',
    smart: 'Thử gõ: “đóng điện ngày 20”',
  },
  en: {
    title: 'Start in 30 seconds',
    sub: 'Add one reminder, bill, or expense so TXPick can start helping every day.',
    reminder: 'Create first reminder',
    bill: 'Add upcoming bill',
    expense: 'Log first expense',
    smart: 'Try typing: “pay electric bill on the 20th”',
  },
}

export default function StarterChecklist({ lang = 'vi', remindersCount = 0, billsCount = 0, expensesCount = 0, className = '' }) {
  const c = copy[lang] || copy.vi
  const allStarted = remindersCount > 0 && billsCount > 0 && expensesCount > 0
  if (allStarted) return null

  const steps = [
    { done: remindersCount > 0, icon: Bell, label: c.reminder, to: '/reminders' },
    { done: billsCount > 0, icon: WalletCards, label: c.bill, to: '/bills' },
    { done: expensesCount > 0, icon: Receipt, label: c.expense, to: '/expenses' },
  ]

  return (
    <section className={`rounded-3xl border border-brand-100 bg-white p-4 sm:p-5 shadow-soft ${className}`}>
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-ink-900">{c.title}</h2>
          <p className="mt-1 text-sm text-ink-500 leading-relaxed">{c.sub}</p>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-2">
        {steps.map((step) => (
          <Link
            key={step.label}
            to={step.to}
            className={`rounded-2xl border px-3 py-3 text-sm font-bold transition active:scale-[0.99] ${
              step.done ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-ink-100 bg-ink-50 text-ink-700 hover:border-brand-200 hover:bg-brand-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <step.icon className="h-4 w-4" />
              <span className="min-w-0 flex-1">{step.label}</span>
              {!step.done && <ArrowRight className="h-3.5 w-3.5" />}
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-3 rounded-2xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800">{c.smart}</p>
    </section>
  )
}
