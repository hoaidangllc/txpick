import { useMemo, useState } from 'react'
import { Bell, Plus, Receipt, CalendarDays, Sparkles, CheckCircle2, Trash2, Wallet, Crown } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, EXPENSE_CATEGORIES, CATEGORIES, fmtUSD, isCurrentMonth, isSameDay, parseNaturalReminder, buildDailyInsight, getPlan, canUseAI, bumpAIUsage, readJSON, writeJSON, todayISO } from '../lib/lifeStore.js'

export default function Today() {
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
  const insight = useMemo(() => getCachedInsight({ reminders, expenses, bills, planKey }), [reminders, expenses, bills, planKey])

  const addQuickReminder = () => {
    if (!quickText.trim()) return
    if (reminders.length >= plan.reminderLimit) return alert('Free limit reached. Upgrade to add more reminders.')
    const parsed = parseNaturalReminder(quickText)
    remApi.add({ ...parsed, done: false, source: 'quick', notes: '' })
    setQuickText('')
  }

  return (
    <div className="container-app py-5 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">Xin chào — mở app mỗi ngày là thắng nhỏ rồi</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900">Today</h1>
          <p className="text-ink-500 mt-1">Reminder, bill, chi tiêu cá nhân và business gom chung một chỗ.</p>
        </div>
        <PlanBadge planKey={planKey} onChange={planApi.setValue} />
      </div>

      {plan.ads && <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-3 text-center text-xs text-ink-400">Free plan ad placeholder — nhẹ thôi, không phá app.</div>}

      <section className="mt-5 grid sm:grid-cols-4 gap-3">
        <StatCard label="Today reminders" value={todayReminders.length} icon={Bell} tone="brand" />
        <StatCard label="This month" value={fmtUSD(monthTotal)} icon={Wallet} />
        <StatCard label="Business" value={fmtUSD(businessTotal)} icon={Receipt} tone="gold" />
        <StatCard label="Personal" value={fmtUSD(personalTotal)} icon={CalendarDays} tone="ink" />
      </section>

      <section className="mt-5 card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-ink-900">Daily smart insight</h2>
              <span className="text-xs text-ink-400">Cached daily • no AI call every open</span>
            </div>
            <p className="mt-1 text-sm text-ink-600">{insight}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink-900 flex items-center gap-2"><Bell className="w-4 h-4 text-brand-600" /> Quick reminder</h2>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input value={quickText} onChange={(e) => setQuickText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuickReminder()} className="input" placeholder='Ví dụ: nhắc tôi trả bill điện ngày mai 9pm' />
            <button onClick={addQuickReminder} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <p className="mt-2 text-xs text-ink-400">AI nhẹ: app hiểu câu tự nhiên bằng parser local trước. Sau này mới gọi AI khi cần.</p>

          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">Today</h3>
            <ReminderList items={todayReminders} api={remApi} empty="Không có reminder hôm nay." />
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-ink-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-brand-600" /> Fast add</h2>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setExpenseOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> Expense</button>
            <button onClick={() => setBillOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> Monthly bill</button>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">Upcoming</h3>
            <ReminderList items={upcoming} api={remApi} empty="Chưa có việc sắp tới." compact />
          </div>
        </div>
      </section>

      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} onSave={(item) => { if (expenses.length >= plan.expenseLimit) return alert('Expense limit reached. Upgrade to Pro.'); expApi.add(item); setExpenseOpen(false) }} />
      <BillModal open={billOpen} onClose={() => setBillOpen(false)} onSave={(item) => { billApi.add(item); setBillOpen(false) }} />
    </div>
  )
}

function getCachedInsight(payload) {
  const key = `${STORAGE_KEYS.dailySummary}_${todayISO()}`
  const cached = readJSON(key, null)
  if (cached?.text) return cached.text
  const usage = canUseAI(payload.planKey)
  if (usage.allowed) bumpAIUsage()
  const text = buildDailyInsight(payload)
  writeJSON(key, { text, createdAt: new Date().toISOString(), local: true })
  return text
}

function PlanBadge({ planKey, onChange }) {
  return <div className="flex items-center gap-2"><span className="badge bg-gold-500/10 text-gold-700"><Crown className="w-3 h-3" /> {getPlan(planKey).name}</span><select className="input !py-2 !w-auto text-sm" value={planKey} onChange={(e) => onChange(e.target.value)}><option value="free">Free</option><option value="basic">Pro $1.99</option><option value="premium">Pro $4.99</option></select></div>
}

function ReminderList({ items, api, empty, compact }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-400">{empty}</p>
  return <ul className="mt-2 divide-y divide-ink-100">{items.map((r) => <li key={r.id} className="py-3 flex items-start justify-between gap-3"><div><p className="font-semibold text-ink-900">{r.title}</p><p className="text-xs text-ink-500">{r.date || 'No date'} {r.time ? '• ' + r.time : ''} • {r.category} {r.repeat && r.repeat !== 'none' ? '• ' + r.repeat : ''}</p>{!compact && r.notes ? <p className="text-xs text-ink-400 mt-1">{r.notes}</p> : null}</div><div className="flex gap-2"><button onClick={() => api.update(r.id, { done: true, doneAt: new Date().toISOString() })} className="text-brand-600"><CheckCircle2 className="w-5 h-5" /></button><button onClick={() => api.remove(r.id)} className="text-ink-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></li>)}</ul>
}

function ExpenseModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' })
  const save = () => { if (!form.title || !form.amount) return; onSave({ ...form, amount: Number(form.amount) }); setForm({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' }) }
  return <Modal open={open} onClose={onClose} title="Add expense" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}><FormInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><FormInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><label className="label">Category</label><select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label} / {c.vi}</option>)}</select><FormInput label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></Modal>
}

function BillModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', amount: '', category: 'bill', dueDay: '1' })
  const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', category: 'bill', dueDay: '1' }) }
  return <Modal open={open} onClose={onClose} title="Add monthly bill" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}><FormInput label="Bill name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><FormInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><FormInput label="Due day" type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} /><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label} / {c.vi}</option>)}</select></Modal>
}

function FormInput({ label, value, onChange, type = 'text' }) { return <label className="block mb-3"><span className="label">{label}</span><input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label> }
