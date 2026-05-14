import { useEffect, useMemo, useState } from 'react'
import {
  Bell, Plus, Receipt, CalendarDays, Sparkles, CheckCircle2, Trash2,
  Wallet, Crown, ArrowRight, Smartphone, AlertTriangle,
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
import { buildTodayFocus, getBillBuckets, getReminderBuckets } from '../lib/assistantIntelligence.js'
import { ensurePermission, notificationSupported, startNotificationTicker } from '../lib/notifications.js'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const txt = {
  vi: {
    title: 'Hôm nay',
    sub: 'Việc cần nhớ, hóa đơn và chi tiêu trong ngày — gom gọn ở một chỗ.',
    ad: 'Gói miễn phí có hiển thị một mục quảng cáo nhỏ.',
    remindersToday: 'Việc hôm nay',
    thisMonth: 'Chi tiêu tháng này',
    business: 'Kinh doanh',
    personal: 'Cá nhân',
    insight: 'Gợi ý hôm nay',
    cached: 'Cập nhật từ dữ liệu thật trong Supabase',
    focus: 'Trọng tâm cần làm',
    urgent: 'Quá hạn / cần chú ý',
    notify: 'Bật thông báo',
    notifyOn: 'Thông báo đã bật',
    notifyOff: 'Thông báo chưa bật',
    quick: 'Nhắc nhanh',
    add: 'Thêm',
    placeholder: 'Ví dụ: nhắc tôi trả tiền điện ngày mai lúc 9 giờ tối',
    helper: 'Gõ tự nhiên như đang nhắn tin. App tự nhận ngày, giờ và phân loại khi đọc được.',
    today: 'Cần làm hôm nay',
    noToday: 'Hôm nay chưa có việc nào. Một ngày nhẹ nhàng.',
    noTodayCTA: 'Thêm việc đầu tiên',
    fastAdd: 'Thêm nhanh',
    expense: 'Chi tiêu',
    monthlyBill: 'Hóa đơn hằng tháng',
    upcoming: 'Sắp tới',
    noUpcoming: 'Chưa có việc sắp tới.',
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
    none: '—',
  },
  en: {
    title: 'Today',
    sub: 'Reminders, bills, and today’s expenses — all in one calm view.',
    ad: 'Free plan shows a small ad area. Upgrade to remove it.',
    remindersToday: 'Reminders today',
    thisMonth: 'This month',
    business: 'Business',
    personal: 'Personal',
    insight: 'Daily insight',
    cached: 'Powered by your live Supabase data',
    focus: 'Today focus',
    urgent: 'Overdue / urgent',
    notify: 'Enable notifications',
    notifyOn: 'Notifications enabled',
    notifyOff: 'Notifications off',
    quick: 'Quick reminder',
    add: 'Add',
    placeholder: 'Example: remind me to pay the electric bill tomorrow at 9 PM',
    helper: 'Type naturally. The app picks up date, time, and category when it can.',
    today: 'Today',
    noToday: 'Nothing on your plate today. Enjoy the calm.',
    noTodayCTA: 'Add your first task',
    fastAdd: 'Fast add',
    expense: 'Expense',
    monthlyBill: 'Monthly bill',
    upcoming: 'Upcoming',
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
  const planKey = profile?.is_pro ? 'premium' : 'free'
  const [quickText, setQuickText] = useState('')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [billOpen, setBillOpen] = useState(false)
  const [notifyState, setNotifyState] = useState(() => (notificationSupported() ? Notification.permission : 'unsupported'))
  const plan = getPlan(planKey)

  const reminderBuckets = useMemo(() => getReminderBuckets(reminders), [reminders])
  const billBuckets = useMemo(() => getBillBuckets(bills), [bills])
  const focusText = useMemo(
    () => buildTodayFocus({ reminders, bills, expenses, lang }),
    [reminders, bills, expenses, lang],
  )

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isCurrentMonth(e.date)),
    [expenses],
  )
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const businessTotal = monthExpenses
    .filter((e) => ['business', 'salon', 'supply'].includes(e.category))
    .reduce((s, e) => s + Number(e.amount || 0), 0)
  const personalTotal = monthTotal - businessTotal
  const insight = useMemo(
    () => buildDailyInsight({ reminders, expenses, bills, planKey, lang }),
    [reminders, expenses, bills, planKey, lang],
  )

  useEffect(() => {
    if (!notificationSupported() || notifyState !== 'granted') return undefined
    return startNotificationTicker(() => ({ reminders, bills, lang }), 60_000)
  }, [reminders, bills, lang, notifyState])

  const enableNotifications = async () => {
    const state = await ensurePermission()
    setNotifyState(state)
  }

  const userName = (user?.email?.split('@')[0] || '').replace(/[._-]+/g, ' ').trim()

  const addQuickReminder = () => {
    if (!quickText.trim()) return
    if (reminders.length >= plan.reminderLimit) return alert(c.limitReminder)
    const parsed = parseNaturalReminder(quickText)
    remApi.add({ ...parsed, done: false, source: 'quick', notes: '' })
    setQuickText('')
  }

  return (
    <div className="container-app py-5 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {todayLabel(c)}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-ink-900">
            {greetingFor(c)}{userName ? `, ${userName}` : ''}.
          </h1>
          <p className="text-ink-500 mt-1 max-w-xl">{c.sub}</p>
        </div>
        <span className="badge bg-gold-500/10 text-gold-700">
          <Crown className="w-3 h-3" /> {planLabel(planKey, lang)}
        </span>
      </div>

      {plan.ads && (
        <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-3 text-center text-xs text-ink-400">
          {c.ad}
        </div>
      )}

      {(remState.error || expState.error || billState.error) && (
        <p className="mt-4 text-sm text-rose-600">{remState.error || expState.error || billState.error}</p>
      )}

      <section className="mt-5 grid lg:grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="card p-4 sm:p-5 border-l-4 border-l-brand-500">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-ink-900">{c.focus}</h2>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">{focusText}</p>
              {(reminderBuckets.overdue.length > 0 || billBuckets.overdue.length > 0) && (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  {c.urgent}: {reminderBuckets.overdue.length + billBuckets.overdue.length}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-50 text-ink-700 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-ink-900">PWA</h2>
              <p className="text-xs text-ink-500">{notifyState === 'granted' ? c.notifyOn : c.notifyOff}</p>
            </div>
            <button onClick={enableNotifications} disabled={notifyState === 'granted' || notifyState === 'unsupported'} className="btn-secondary text-xs py-2">
              {c.notify}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={c.remindersToday} value={(reminderBuckets.today.length + reminderBuckets.overdue.length) || c.none} icon={Bell} tone="brand" />
        <StatCard label={c.thisMonth} value={monthTotal ? fmtUSD(monthTotal) : c.none} icon={Wallet} />
        <StatCard label={c.business} value={businessTotal ? fmtUSD(businessTotal) : c.none} icon={Receipt} tone="gold" />
        <StatCard label={c.personal} value={personalTotal ? fmtUSD(personalTotal) : c.none} icon={CalendarDays} tone="ink" />
      </section>

      <section className="mt-5 card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-ink-900">{c.insight}</h2>
              <span className="text-xs text-ink-400">{c.cached}</span>
            </div>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">{insight}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
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
      <div className="py-6 text-center">
        <p className="text-sm text-ink-400">{empty}</p>
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
          <div>
            <p className="font-semibold text-ink-900">{r.title}</p>
            <p className="text-xs text-ink-500">
              {r.date || c.noDate}{r.time ? ` • ${r.time}` : ''} • {categoryLabel(r.category, lang)}{r.repeat && r.repeat !== 'none' ? ` • ${repeatLabel(r.repeat, lang)}` : ''}
            </p>
            {!compact && r.notes ? <p className="text-xs text-ink-400 mt-1">{r.notes}</p> : null}
          </div>
          <div className="flex gap-2">
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
