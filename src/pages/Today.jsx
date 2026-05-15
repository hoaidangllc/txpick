import { useEffect, useMemo, useState } from 'react'
import {
  Bell, Plus, Receipt, Sparkles, CheckCircle2, Trash2,
  Wallet, Crown, ArrowRight, AlertTriangle, WalletCards, Inbox,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import {
  EXPENSE_CATEGORIES, CATEGORIES, fmtUSD, isCurrentMonth,
  parseNaturalReminder, buildDailyInsight, getPlan,
  todayISO, categoryLabel, repeatLabel,
  planLabel,
} from '../lib/lifeStore.js'
import { billsDb, expensesDb, remindersDb, useRemoteCollection } from '../lib/db.js'
import { enableBackgroundReminders, getPushStatus } from '../lib/notifications.js'
import { getUserDisplayName } from '../lib/userDisplay.js'
import { getBillBuckets, getReminderBuckets } from '../lib/assistantIntelligence.js'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const txt = {
  vi: {
    sub: 'Mở app, xem việc cần làm hôm nay, ghi nhanh chi tiêu, rồi quay về với gia đình.',
    remindersToday: 'Việc hôm nay',
    thisMonth: 'Chi tiêu tháng này',
    billsDue: 'Hóa đơn sắp tới',
    insight: 'Gợi ý hôm nay',
    urgent: 'Cần chú ý ngay',
    urgentBody: (overdue, dueToday) => `Có ${overdue} việc quá hạn và ${dueToday} mục tới hạn hôm nay. Xử lý nhóm này trước cho nhẹ đầu.`,
    quick: 'Thêm nhanh bằng câu tự nhiên',
    add: 'Thêm',
    placeholder: 'Ví dụ: nhắc tôi trả tiền điện ngày mai lúc 9 giờ tối',
    helper: 'Gõ tự nhiên như đang nhắn tin. App tự nhận ngày, giờ và phân loại.',
    today: 'Cần làm hôm nay',
    noToday: 'Hôm nay nhẹ nhàng. Bạn không có việc nào tới hạn.',
    noTodayCTA: 'Thêm việc đầu tiên',
    fastAdd: 'Thêm chi tiêu / hóa đơn',
    fastAddSub: 'Ghi tay một dòng — cuối tháng không phải ngồi nhớ lại.',
    expense: 'Chi tiêu',
    monthlyBill: 'Hóa đơn',
    upcoming: 'Sắp tới',
    noUpcoming: 'Chưa có việc nào sắp tới.',
    noUpcomingCTA: 'Tạo nhắc việc',
    limitReminder: 'Bạn đã đạt giới hạn nhắc việc của gói hiện tại.',
    limitExpense: 'Bạn đã đạt giới hạn chi tiêu của gói hiện tại.',
    noDate: 'Chưa chọn ngày',
    category: 'Phân loại',
    close: 'Đóng',
    save: 'Lưu',
    expenseTitle: 'Thêm chi tiêu',
    expenseName: 'Tên chi tiêu',
    amount: 'Số tiền',
    date: 'Ngày',
    billTitle: 'Thêm hóa đơn hằng tháng',
    billName: 'Tên hóa đơn',
    dueDay: 'Ngày đến hạn trong tháng',
    greetMorning: 'Chào buổi sáng',
    greetAfternoon: 'Chào buổi chiều',
    greetEvening: 'Chào buổi tối',
    greetNight: 'Khuya rồi, chúc bạn ngủ ngon',
    weekday: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    monthFmt: (d) => `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
    phonePromptTitle: 'Bật nhắc trên điện thoại',
    phonePromptBody: 'Cài app vào màn hình chính và bật thông báo để nhắc việc vẫn báo khi bạn không mở app.',
    phonePromptButton: 'Bật nhắc ngay',
    phonePromptOn: 'Đã bật nhắc trên thiết bị này.',
    phonePromptUnsupported: 'Thiết bị/trình duyệt này chưa hỗ trợ nhắc nền. Hãy thử sau khi cài app vào màn hình chính.',
    phonePromptDenied: 'Bạn đã chặn thông báo. Mở quyền notification trong cài đặt máy để bật lại.',
    phonePromptNotReady: 'Nhắc trên điện thoại chưa sẵn sàng trên bản deploy này.',
    none: '—',
  },
  en: {
    sub: 'Open the app, see what matters today, log a quick expense, and get back to your family.',
    remindersToday: 'Tasks today',
    thisMonth: 'Spending this month',
    billsDue: 'Bills due soon',
    insight: 'Today highlight',
    urgent: 'Needs attention',
    urgentBody: (overdue, dueToday) => `${overdue} overdue and ${dueToday} due today. Clear these first to free up your day.`,
    quick: 'Quick add — natural language',
    add: 'Add',
    placeholder: 'Example: remind me to pay the electric bill tomorrow at 9 PM',
    helper: 'Type the way you would text. The app picks up date, time, and category.',
    today: 'On your plate today',
    noToday: 'Nothing on your plate today. Enjoy the calm.',
    noTodayCTA: 'Add your first task',
    fastAdd: 'Log an expense or bill',
    fastAddSub: 'One quick line now means no scrambling at month-end.',
    expense: 'Expense',
    monthlyBill: 'Bill',
    upcoming: 'Coming up',
    noUpcoming: 'Nothing upcoming yet.',
    noUpcomingCTA: 'Create a reminder',
    limitReminder: 'You reached the reminder limit for your plan.',
    limitExpense: 'You reached the expense limit for your plan.',
    noDate: 'No date',
    category: 'Category',
    close: 'Close',
    save: 'Save',
    expenseTitle: 'Add expense',
    expenseName: 'Expense name',
    amount: 'Amount',
    date: 'Date',
    billTitle: 'Add monthly bill',
    billName: 'Bill name',
    dueDay: 'Due day of month',
    greetMorning: 'Good morning',
    greetAfternoon: 'Good afternoon',
    greetEvening: 'Good evening',
    greetNight: 'It’s late — rest well',
    weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthFmt: (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    phonePromptTitle: 'Enable phone reminders',
    phonePromptBody: 'Install the app and enable notifications so reminders can alert you even when the app is closed.',
    phonePromptButton: 'Enable reminders',
    phonePromptOn: 'Phone reminders are enabled on this device.',
    phonePromptUnsupported: 'This device/browser does not support background reminders yet. Try after installing the app.',
    phonePromptDenied: 'Notifications are blocked. Allow notifications in phone/browser settings to enable this.',
    phonePromptNotReady: 'Phone reminders are not ready on this deployment yet.',
    none: '—',
  },
}

function greetingFor(c) {
  const h = new Date().getHours()
  if (h < 5) return c.greetNight
  if (h < 12) return c.greetMorning
  if (h < 17) return c.greetAfternoon
  if (h < 22) return c.greetEvening
  return c.greetNight
}

function todayLabel(c) {
  const d = new Date()
  return `${c.weekday[d.getDay()]}, ${c.monthFmt(d)}`
}

export default function Today() {
  const { lang } = useLang()
  const { user, profile } = useAuth()
  const c = txt[lang]
  const [reminders, remApi, remState] = useRemoteCollection(user?.id, remindersDb)
  const [expenses, expApi, expState] = useRemoteCollection(user?.id, expensesDb)
  const [bills, billApi, billState] = useRemoteCollection(user?.id, billsDb)
  const planKey = profile?.plan_key || (profile?.is_pro ? 'premium' : 'free')
  const [quickText, setQuickText] = useState('')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [billOpen, setBillOpen] = useState(false)
  const [push, setPush] = useState({ supported: false, permission: 'default', subscribed: false })
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMessage, setPushMessage] = useState('')
  const plan = getPlan(planKey)

  const reminderBuckets = useMemo(() => getReminderBuckets(reminders), [reminders])
  const billBuckets = useMemo(() => getBillBuckets(bills), [bills])

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isCurrentMonth(e.date)),
    [expenses],
  )
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const insight = useMemo(
    () => buildDailyInsight({ reminders, expenses, bills, planKey, lang }),
    [reminders, expenses, bills, planKey, lang],
  )

  const overdueCount = reminderBuckets.overdue.length + billBuckets.overdue.length
  const dueTodayCount = reminderBuckets.today.length + billBuckets.dueToday.length
  const hasUrgent = overdueCount > 0 || billBuckets.dueToday.length > 0
  const billsSoon = billBuckets.dueToday.length + billBuckets.dueSoon.length + billBuckets.overdue.length

  const userName = getUserDisplayName(user, profile)

  const addQuickReminder = () => {
    if (!quickText.trim()) return
    if (reminders.length >= plan.reminderLimit) return alert(c.limitReminder)
    const parsed = parseNaturalReminder(quickText)
    remApi.add({ ...parsed, done: false, source: 'quick', notes: '' })
    setQuickText('')
  }

  const loadError = remState.error || expState.error || billState.error


  useEffect(() => {
    let alive = true
    getPushStatus().then((status) => { if (alive) setPush(status) }).catch(() => undefined)
    return () => { alive = false }
  }, [])

  async function enablePhoneReminder() {
    setPushBusy(true)
    setPushMessage('')
    try {
      const result = await enableBackgroundReminders()
      const status = await getPushStatus()
      setPush(status)
      if (result.ok) setPushMessage(c.phonePromptOn)
      else if (result.status === 'denied') setPushMessage(c.phonePromptDenied)
      else if (result.status === 'unsupported') setPushMessage(c.phonePromptUnsupported)
      else setPushMessage(c.phonePromptNotReady)
    } catch {
      setPushMessage(c.phonePromptNotReady)
    } finally {
      setPushBusy(false)
    }
  }

  return (
    <div className="container-app py-5 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {todayLabel(c)}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-ink-900 leading-tight">
            {greetingFor(c)}{userName ? `, ${userName}` : ''}.
          </h1>
          <p className="text-ink-500 mt-1 max-w-xl">{c.sub}</p>
        </div>
        <span className="badge bg-gold-500/10 text-gold-700 shrink-0">
          <Crown className="w-3 h-3" /> {planLabel(planKey, lang)}
        </span>
      </div>

      {loadError && (
        <p className="mt-4 text-sm text-rose-600">{loadError}</p>
      )}

      {/* Single highlight callout — replaces the old Focus + Briefing + Insight stack */}
      <section className={`mt-5 card p-4 sm:p-5 ${hasUrgent ? 'border-rose-100 bg-rose-50/40' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasUrgent ? 'bg-rose-100 text-rose-700' : 'bg-brand-50 text-brand-700'}`}>
            {hasUrgent ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-ink-900">{hasUrgent ? c.urgent : c.insight}</h2>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">
              {hasUrgent ? c.urgentBody(overdueCount, dueTodayCount) : insight}
            </p>
          </div>
        </div>
      </section>


      {!push.subscribed && (
        <section className="mt-4 card p-4 sm:p-5 border-brand-100 bg-brand-50/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white text-brand-700 shadow-soft">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-ink-900">{c.phonePromptTitle}</h2>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">{push.supported ? c.phonePromptBody : c.phonePromptUnsupported}</p>
              {pushMessage && <p className="mt-2 text-xs font-semibold text-brand-800">{pushMessage}</p>}
            </div>
          </div>
          <button className="btn-primary w-full sm:w-auto mt-4" onClick={enablePhoneReminder} disabled={pushBusy || !push.supported}>
            <Bell className="w-4 h-4" /> {pushBusy ? '…' : c.phonePromptButton}
          </button>
        </section>
      )}

      <section className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label={c.remindersToday} value={(reminderBuckets.today.length + reminderBuckets.overdue.length) || c.none} icon={Bell} tone="brand" />
        <StatCard label={c.thisMonth} value={monthTotal ? fmtUSD(monthTotal) : c.none} icon={Wallet} />
        <StatCard label={c.billsDue} value={billsSoon || c.none} icon={WalletCards} tone={billBuckets.overdue.length ? 'rose' : 'ink'} />
      </section>

      <section className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" /> {c.quick}
          </h2>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuickReminder()}
              className="input"
              placeholder={c.placeholder}
            />
            <button onClick={addQuickReminder} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" /> {c.add}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400">{c.helper}</p>
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">{c.today}</h3>
            <ReminderList items={[...reminderBuckets.overdue, ...reminderBuckets.today]} api={remApi} empty={c.noToday} emptyCTA={c.noTodayCTA} emptyHref="/reminders" lang={lang} c={c} />
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" /> {c.fastAdd}
          </h2>
          <p className="mt-1 text-xs text-ink-500">{c.fastAddSub}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setExpenseOpen(true)} className="btn-secondary justify-start">
              <Plus className="w-4 h-4" /> {c.expense}
            </button>
            <button onClick={() => setBillOpen(true)} className="btn-secondary justify-start">
              <Plus className="w-4 h-4" /> {c.monthlyBill}
            </button>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">{c.upcoming}</h3>
            <ReminderList items={reminderBuckets.upcoming.slice(0, 6)} api={remApi} empty={c.noUpcoming} emptyCTA={c.noUpcomingCTA} emptyHref="/reminders" compact lang={lang} c={c} />
          </div>
        </div>
      </section>

      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} onSave={(item) => { if (expenses.length >= plan.expenseLimit) return alert(c.limitExpense); expApi.add(item); setExpenseOpen(false) }} lang={lang} c={c} />
      <BillModal open={billOpen} onClose={() => setBillOpen(false)} onSave={(item) => { billApi.add(item); setBillOpen(false) }} lang={lang} c={c} />
    </div>
  )
}

function ReminderList({ items, api, empty, emptyCTA, emptyHref, compact, lang, c }) {
  if (!items.length) {
    return (
      <div className="mt-2 rounded-2xl bg-ink-50 border border-ink-100 px-4 py-6 text-center">
        <div className="mx-auto w-10 h-10 rounded-xl bg-white border border-ink-100 text-ink-400 flex items-center justify-center">
          <Inbox className="w-5 h-5" />
        </div>
        <p className="mt-3 text-sm text-ink-500">{empty}</p>
        {emptyCTA && emptyHref && (
          <Link to={emptyHref} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
            {emptyCTA} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    )
  }
  return (
    <ul className="mt-2 divide-y divide-ink-100">
      {items.map((r) => (
        <li key={r.id} className="py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{r.title}</p>
            <p className="text-xs text-ink-500">
              {r.date || c.noDate}{r.time ? ` • ${r.time}` : ''} • {categoryLabel(r.category, lang)}{r.repeat && r.repeat !== 'none' ? ` • ${repeatLabel(r.repeat, lang)}` : ''}
            </p>
            {!compact && r.notes ? <p className="text-xs text-ink-400 mt-1">{r.notes}</p> : null}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => api.update(r.id, { done: true, doneAt: new Date().toISOString() })} className="text-brand-600 hover:text-brand-800" aria-label="Done"><CheckCircle2 className="w-5 h-5" /></button>
            <button onClick={() => api.remove(r.id)} className="text-ink-300 hover:text-rose-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ExpenseModal({ open, onClose, onSave, lang, c }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' })
  const save = () => { if (!form.title || !form.amount) return; onSave({ ...form, amount: Number(form.amount) }); setForm({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' }) }
  return (
    <Modal open={open} onClose={onClose} title={c.expenseTitle} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <FormInput label={c.expenseName} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <FormInput label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <label className="label">{c.category}</label>
      <select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {EXPENSE_CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang, EXPENSE_CATEGORIES)}</option>)}
      </select>
      <FormInput label={c.date} type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
    </Modal>
  )
}

function BillModal({ open, onClose, onSave, lang, c }) {
  const [form, setForm] = useState({ name: '', amount: '', category: 'bill', dueDay: '1' })
  const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', category: 'bill', dueDay: '1' }) }
  return (
    <Modal open={open} onClose={onClose} title={c.billTitle} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <FormInput label={c.billName} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <FormInput label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <FormInput label={c.dueDay} type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} />
      <label className="label">{c.category}</label>
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang)}</option>)}
      </select>
    </Modal>
  )
}

function FormInput({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
