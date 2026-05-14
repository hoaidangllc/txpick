import { useMemo, useState } from 'react'
import { Bell, Plus, Receipt, CalendarDays, Sparkles, CheckCircle2, Trash2, Wallet, Crown } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, EXPENSE_CATEGORIES, CATEGORIES, fmtUSD, isCurrentMonth, isSameDay, parseNaturalReminder, buildDailyInsight, getPlan, canUseAI, bumpAIUsage, readJSON, writeJSON, todayISO } from '../lib/lifeStore.js'
import { categoryLabel, repeatLabel, textFor } from '../lib/uiText.js'

export default function Today() {
  const { lang } = useLang()
  const ui = textFor(lang)
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
    if (reminders.length >= plan.reminderLimit) return alert(ui.today.limitReminder)
    const parsed = parseNaturalReminder(quickText)
    remApi.add({ ...parsed, done: false, source: 'quick', notes: '' })
    setQuickText('')
  }

  return (
    <div className="container-app py-5 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">{ui.today.greeting}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900">{ui.today.title}</h1>
          <p className="text-ink-500 mt-1">{ui.today.subtitle}</p>
        </div>
        <PlanBadge planKey={planKey} onChange={planApi.setValue} />
      </div>

      {plan.ads && <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-3 text-center text-xs text-ink-400">{ui.today.ad}</div>}

      <section className="mt-5 grid sm:grid-cols-4 gap-3">
        <StatCard label={ui.today.statsReminders} value={todayReminders.length} icon={Bell} tone="brand" />
        <StatCard label={ui.today.statsMonth} value={fmtUSD(monthTotal)} icon={Wallet} />
        <StatCard label={ui.today.statsBusiness} value={fmtUSD(businessTotal)} icon={Receipt} tone="gold" />
        <StatCard label={ui.today.statsPersonal} value={fmtUSD(personalTotal)} icon={CalendarDays} tone="ink" />
      </section>

      <section className="mt-5 card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-ink-900">{ui.today.insightTitle}</h2>
              <span className="text-xs text-ink-400">{ui.today.insightMeta}</span>
            </div>
            <p className="mt-1 text-sm text-ink-600">{insight}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink-900 flex items-center gap-2"><Bell className="w-4 h-4 text-brand-600" /> {ui.today.quickTitle}</h2>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input value={quickText} onChange={(e) => setQuickText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuickReminder()} className="input" placeholder={ui.today.quickPlaceholder} />
            <button onClick={addQuickReminder} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> {ui.common.add}</button>
          </div>
          <p className="mt-2 text-xs text-ink-400">{ui.today.quickHelp}</p>

          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">{ui.today.todaySection}</h3>
            <ReminderList items={todayReminders} api={remApi} empty={ui.today.emptyToday} lang={lang} />
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-brand-600" /> {ui.today.fastAdd}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setExpenseOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> {ui.today.expense}</button>
            <button onClick={() => setBillOpen(true)} className="btn-secondary justify-start"><Plus className="w-4 h-4" /> {ui.today.monthlyBill}</button>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-700">{ui.today.upcomingSection}</h3>
            <ReminderList items={upcoming} api={remApi} empty={ui.today.emptyUpcoming} compact lang={lang} />
          </div>
        </div>
      </section>

      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} onSave={(item) => { if (expenses.length >= plan.expenseLimit) return alert(ui.today.limitExpense); expApi.add(item); setExpenseOpen(false) }} lang={lang} />
      <BillModal open={billOpen} onClose={() => setBillOpen(false)} onSave={(item) => { billApi.add(item); setBillOpen(false) }} lang={lang} />
    </div>
  )
}

function getCachedInsight(payload) {
  const key = `${STORAGE_KEYS.dailySummary}_${todayISO()}_${payload.lang || 'en'}`
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

function ReminderList({ items, api, empty, compact, lang }) {
  const ui = textFor(lang)
  if (!items.length) return <p className="py-6 text-center text-sm text-ink-400">{empty}</p>
  return <ul className="mt-2 divide-y divide-ink-100">{items.map((r) => <li key={r.id} className="py-3 flex items-start justify-between gap-3"><div><p className="font-semibold text-ink-900">{r.title}</p><p className="text-xs text-ink-500">{r.date || ui.today.noDate} {r.time ? '• ' + r.time : ''} • {categoryLabel(r.category, lang)} {r.repeat && r.repeat !== 'none' ? '• ' + repeatLabel(r.repeat, lang) : ''}</p>{!compact && r.notes ? <p className="text-xs text-ink-400 mt-1">{r.notes}</p> : null}</div><div className="flex gap-2"><button onClick={() => api.update(r.id, { done: true, doneAt: new Date().toISOString() })} className="text-brand-600"><CheckCircle2 className="w-5 h-5" /></button><button onClick={() => api.remove(r.id)} className="text-ink-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></li>)}</ul>
}

function ExpenseModal({ open, onClose, onSave, lang }) {
  const ui = textFor(lang)
  const [form, setForm] = useState({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' })
  const save = () => { if (!form.title || !form.amount) return; onSave({ ...form, amount: Number(form.amount) }); setForm({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' }) }
  return <Modal open={open} onClose={onClose} title={ui.today.addExpense} footer={<><button className="btn-secondary" onClick={onClose}>{ui.common.cancel}</button><button className="btn-primary" onClick={save}>{ui.common.save}</button></>}><FormInput label={ui.common.title} value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><FormInput label={ui.common.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><label className="label">{ui.common.category}</label><select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{categoryLabel(c.key, lang)}</option>)}</select><FormInput label={ui.common.date} type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></Modal>
}

function BillModal({ open, onClose, onSave, lang }) {
  const ui = textFor(lang)
  const [form, setForm] = useState({ name: '', amount: '', category: 'bill', dueDay: '1' })
  const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', category: 'bill', dueDay: '1' }) }
  return <Modal open={open} onClose={onClose} title={ui.today.addBill} footer={<><button className="btn-secondary" onClick={onClose}>{ui.common.cancel}</button><button className="btn-primary" onClick={save}>{ui.common.save}</button></>}><FormInput label={ui.today.billName} value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><FormInput label={ui.common.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><FormInput label={ui.today.dueDay} type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} /><label className="label">{ui.common.category}</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{categoryLabel(c.key, lang)}</option>)}</select></Modal>
}

function FormInput({ label, value, onChange, type = 'text' }) { return <label className="block mb-3"><span className="label">{label}</span><input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label> }
