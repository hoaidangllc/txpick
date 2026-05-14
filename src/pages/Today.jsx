import { useMemo, useState } from 'react'
import { Bell, Plus, Receipt, CalendarDays, Sparkles, CheckCircle2, Trash2, Wallet, Crown } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, EXPENSE_CATEGORIES, CATEGORIES, fmtUSD, isCurrentMonth, isSameDay, parseNaturalReminder, buildDailyInsight, getPlan, canUseAI, bumpAIUsage, readJSON, writeJSON, todayISO, categoryLabel, repeatLabel, planLabel } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const txt = {
  vi: {
    hello: 'Chào bạn, hôm nay mình kiểm tra nhanh nhé.', title: 'Hôm nay', sub: 'Việc cần nhớ, hóa đơn và chi tiêu trong ngày nằm gọn ở đây.',
    ad: 'Gói miễn phí có thể hiển thị quảng cáo nhẹ.', remindersToday: 'Việc hôm nay', thisMonth: 'Tháng này', business: 'Kinh doanh', personal: 'Cá nhân',
    insight: 'Gợi ý hôm nay', cached: 'Lưu theo ngày • tiết kiệm lượt AI', quick: 'Nhắc nhanh', add: 'Thêm', placeholder: 'Ví dụ: nhắc tôi trả tiền điện ngày mai 9pm', helper: 'Gõ tự nhiên như đang nhắn tin. App sẽ tự nhận ngày, giờ và loại việc khi có thể.', today: 'Cần làm hôm nay', noToday: 'Hôm nay chưa có việc cần nhớ.', fastAdd: 'Thêm nhanh', expense: 'Chi tiêu', monthlyBill: 'Hóa đơn hằng tháng', upcoming: 'Sắp tới', noUpcoming: 'Chưa có việc sắp tới.', limitReminder: 'Bạn đã đạt giới hạn nhắc việc của gói hiện tại.', limitExpense: 'Bạn đã đạt giới hạn chi tiêu của gói hiện tại.', noDate: 'Chưa chọn ngày', category: 'Phân loại', close: 'Đóng', save: 'Lưu', expenseTitle: 'Thêm chi tiêu', expenseName: 'Tên chi tiêu', amount: 'Số tiền', date: 'Ngày', billTitle: 'Thêm hóa đơn hằng tháng', billName: 'Tên hóa đơn', dueDay: 'Ngày đến hạn trong tháng', free: 'Miễn phí', basic: 'Pro Cơ Bản', premium: 'Pro Plus',
  },
  en: {
    hello: 'Welcome back. Let’s keep today organized.', title: 'Today', sub: 'Your main page for reminders, bills, and daily expenses.',
    ad: 'Free plan may show light ads.', remindersToday: 'Today reminders', thisMonth: 'This month', business: 'Business', personal: 'Personal',
    insight: 'Daily insight', cached: 'Cached daily • no AI call every time you open the app', quick: 'Quick reminder', add: 'Add', placeholder: 'Example: remind me to pay electric bill tomorrow 9pm', helper: 'Type naturally. The app parses locally first, so it still works without AI.', today: 'Today', noToday: 'No reminders due today.', fastAdd: 'Fast add', expense: 'Expense', monthlyBill: 'Monthly bill', upcoming: 'Upcoming', noUpcoming: 'Nothing upcoming yet.', limitReminder: 'You reached the reminder limit for your current plan.', limitExpense: 'You reached the expense limit for your current plan.', noDate: 'No date', category: 'Category', close: 'Close', save: 'Save', expenseTitle: 'Add expense', expenseName: 'Expense name', amount: 'Amount', date: 'Date', billTitle: 'Add monthly bill', billName: 'Bill name', dueDay: 'Due day of month', free: 'Free', basic: 'Pro Basic $1.99', premium: 'Pro Plus $4.99',
  },
}

export default function Today() {
  const { lang } = useLang()
  const c = txt[lang]
  const [reminders, remApi] = useLocalStore(STORAGE_KEYS.reminders, [])
  const [expenses, expApi] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills, billApi] = useLocalStore(STORAGE_KEYS.bills, [])
  const [planKey, planApi] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const [quickText, setQuickText] = useState('')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [billOpen, setBillOpen] = useState(false)
  const plan = getPlan(planKey)

  const todayReminders = useMemo(() => reminders.filter((r) => !r.done && isSameDay(r.date)), [reminders])
  const upcoming = useMemo(() => reminders.filter((r) => !r.done && !isSameDay(r.date)).slice(0, 6), [reminders])
  const monthExpenses = useMemo(() => expenses.filter((e) => isCurrentMonth(e.date)), [expenses])
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const businessTotal = monthExpenses.filter((e) => ['business', 'salon', 'supply'].includes(e.category)).reduce((s, e) => s + Number(e.amount || 0), 0)
  const personalTotal = monthTotal - businessTotal
  const insight = useMemo(() => getCachedInsight({ reminders, expenses, bills, planKey, lang }), [reminders, expenses, bills, planKey, lang])

  const addQuickReminder = () => {
    if (!quickText.trim()) return
    if (reminders.length >= plan.reminderLimit) return alert(c.limitReminder)
    const parsed = parseNaturalReminder(quickText)
    remApi.add({ ...parsed, done: false, source: 'quick', notes: '' })
    setQuickText('')
  }

  return <div className="container-app py-5 sm:py-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-brand-700">{c.hello}</p><h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900">{c.title}</h1><p className="text-ink-500 mt-1">{c.sub}</p></div><PlanBadge planKey={planKey} onChange={planApi.setValue} lang={lang} c={c} /></div>{plan.ads && <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-3 text-center text-xs text-ink-400">{c.ad}</div>}<section className="mt-5 grid sm:grid-cols-4 gap-3"><StatCard label={c.remindersToday} value={todayReminders.length} icon={Bell} tone="brand" /><StatCard label={c.thisMonth} value={fmtUSD(monthTotal)} icon={Wallet} /><StatCard label={c.business} value={fmtUSD(businessTotal)} icon={Receipt} tone="gold" /><StatCard label={c.personal} value={fmtUSD(personalTotal)} icon={CalendarDays} tone="ink" /></section><section className="mt-5 card p-4 sm:p-5"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-ink-900">{c.insight}</h2><span className="text-xs text-ink-400">{c.cached}</span></div><p className="mt-1 text-sm text-ink-600">{insight}</p></div></div></section><section className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-4"><div className="card p-4 sm:p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Bell className="w-4 h-4 text-brand-600" /> {c.quick}</h2><div className="mt-3 flex flex-col sm:flex-row gap-2"><input value={quickText} onChange={(e) => setQuickText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuickReminder()} className="input" placeholder={c.placeholder} /><button onClick={addQuickReminder} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> {c.add}</button></div><p className="mt-2 text-xs text-ink-400">{c.helper}</p><div className="mt-5"><h3 className="text-sm font-bold text-ink-700">{c.today}</h3><ReminderList items={todayReminders} api={remApi} empty={c.noToday} lang={lang} c={c} /></div></div><div className="card p-4 sm:p-5"><h2 className="font-bold text-ink-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-brand-600" /> {c.fastAdd}</h2><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setExpenseOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> {c.expense}</button><button onClick={() => setBillOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> {c.monthlyBill}</button></div><div className="mt-5"><h3 className="text-sm font-bold text-ink-700">{c.upcoming}</h3><ReminderList items={upcoming} api={remApi} empty={c.noUpcoming} compact lang={lang} c={c} /></div></div></section><ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} onSave={(item) => { if (expenses.length >= plan.expenseLimit) return alert(c.limitExpense); expApi.add(item); setExpenseOpen(false) }} lang={lang} c={c} /><BillModal open={billOpen} onClose={() => setBillOpen(false)} onSave={(item) => { billApi.add(item); setBillOpen(false) }} lang={lang} c={c} /></div>
}

function getCachedInsight(payload) {
  const key = `${STORAGE_KEYS.dailySummary}_${todayISO()}_${payload.lang}`
  const cached = readJSON(key, null)
  if (cached?.text) return cached.text
  const usage = canUseAI(payload.planKey)
  if (usage.allowed) bumpAIUsage()
  const text = buildDailyInsight(payload)
  writeJSON(key, { text, createdAt: new Date().toISOString(), local: true })
  return text
}

function PlanBadge({ planKey, onChange, lang, c }) {
  return <div className="flex items-center gap-2"><span className="badge bg-gold-500/10 text-gold-700"><Crown className="w-3 h-3" /> {planLabel(planKey, lang)}</span><select className="input !py-2 !w-auto text-sm" value={planKey} onChange={(e) => onChange(e.target.value)}><option value="free">{c.free}</option><option value="basic">{c.basic}</option><option value="premium">{c.premium}</option></select></div>
}

function ReminderList({ items, api, empty, compact, lang, c }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-400">{empty}</p>
  return <ul className="mt-2 divide-y divide-ink-100">{items.map((r) => <li key={r.id} className="py-3 flex items-start justify-between gap-3"><div><p className="font-semibold text-ink-900">{r.title}</p><p className="text-xs text-ink-500">{r.date || c.noDate} {r.time ? '• ' + r.time : ''} • {categoryLabel(r.category, lang)} {r.repeat && r.repeat !== 'none' ? '• ' + repeatLabel(r.repeat, lang) : ''}</p>{!compact && r.notes ? <p className="text-xs text-ink-400 mt-1">{r.notes}</p> : null}</div><div className="flex gap-2"><button onClick={() => api.update(r.id, { done: true, doneAt: new Date().toISOString() })} className="text-brand-600"><CheckCircle2 className="w-5 h-5" /></button><button onClick={() => api.remove(r.id)} className="text-ink-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></li>)}</ul>
}

function ExpenseModal({ open, onClose, onSave, lang, c }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' })
  const save = () => { if (!form.title || !form.amount) return; onSave({ ...form, amount: Number(form.amount) }); setForm({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' }) }
  return <Modal open={open} onClose={onClose} title={c.expenseTitle} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}><FormInput label={c.expenseName} value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><FormInput label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><label className="label">{c.category}</label><select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang, EXPENSE_CATEGORIES)}</option>)}</select><FormInput label={c.date} type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></Modal>
}

function BillModal({ open, onClose, onSave, lang, c }) {
  const [form, setForm] = useState({ name: '', amount: '', category: 'bill', dueDay: '1' })
  const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', category: 'bill', dueDay: '1' }) }
  return <Modal open={open} onClose={onClose} title={c.billTitle} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}><FormInput label={c.billName} value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><FormInput label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><FormInput label={c.dueDay} type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} /><label className="label">{c.category}</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang)}</option>)}</select></Modal>
}

function FormInput({ label, value, onChange, type = 'text' }) { return <label className="block mb-3"><span className="label">{label}</span><input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label> }
