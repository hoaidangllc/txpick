import { useMemo, useState } from 'react'
import { Plus, Home, CreditCard, Bell, Trash2, Wallet, AlertCircle, PieChart } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { DonutChart } from '../components/Chart.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore, fmtUSD } from '../lib/useLocalStore.js'

const BILL_TYPES = [
  { key: 'mortgage', en: 'Mortgage', vi: 'Tiền nhà' },
  { key: 'rent', en: 'Rent', vi: 'Tiền thuê' },
  { key: 'utilities', en: 'Utilities', vi: 'Điện nước' },
  { key: 'internet', en: 'Internet / Phone', vi: 'Internet / Điện thoại' },
  { key: 'car', en: 'Car payment', vi: 'Tiền xe' },
  { key: 'carIns', en: 'Car insurance', vi: 'Bảo hiểm xe' },
  { key: 'health', en: 'Health insurance', vi: 'Bảo hiểm y tế' },
  { key: 'subscription', en: 'Subscriptions', vi: 'Đăng ký dịch vụ' },
  { key: 'other', en: 'Other', vi: 'Khác' },
]

const DEBT_TYPES = [
  { key: 'creditCard', en: 'Credit card', vi: 'Thẻ tín dụng' },
  { key: 'personal', en: 'Personal loan', vi: 'Vay cá nhân' },
  { key: 'student', en: 'Student loan', vi: 'Vay sinh viên' },
  { key: 'auto', en: 'Auto loan', vi: 'Vay mua xe' },
  { key: 'mortgage', en: 'Mortgage', vi: 'Vay nhà' },
  { key: 'other', en: 'Other', vi: 'Khác' },
]

const BILL_COLORS = {
  mortgage: '#0ea5e9', rent: '#0ea5e9', utilities: '#f59e0b', internet: '#8b5cf6',
  car: '#ef4444', carIns: '#ec4899', health: '#10b981', subscription: '#64748b', other: '#94a3b8',
}
const DEBT_COLORS = {
  creditCard: '#ef4444', personal: '#f59e0b', student: '#0ea5e9',
  auto: '#8b5cf6', mortgage: '#10b981', other: '#64748b',
}

export default function PersonalDashboard() {
  const { t, lang } = useLang()
  const [bills, billApi] = useLocalStore('txpick_per_bills', [])
  const [debts, debtApi] = useLocalStore('txpick_per_debts', [])
  const [reminders, remApi] = useLocalStore('txpick_per_reminders', [])

  const [showBill, setShowBill] = useState(false)
  const [showDebt, setShowDebt] = useState(false)
  const [showRem, setShowRem] = useState(false)

  const totalBills = useMemo(() => bills.reduce((s, b) => s + Number(b.amount || 0), 0), [bills])
  const totalDebt = useMemo(() => debts.reduce((s, d) => s + Number(d.balance || 0), 0), [debts])
  const nextDue = useMemo(() => {
    if (!bills.length) return null
    const today = new Date().getDate()
    return bills
      .map((b) => ({ ...b, daysOut: ((b.dueDay - today + 31) % 31) || 31 }))
      .sort((a, b) => a.daysOut - b.daysOut)[0]
  }, [bills])

  const label = (list, key) => {
    const found = list.find((x) => x.key === key)
    return found ? (lang === 'vi' ? found.vi + ' / ' + found.en : found.en + ' / ' + found.vi) : key
  }

  const billSlices = useMemo(() => {
    const byType = {}
    for (const b of bills) byType[b.type] = (byType[b.type] || 0) + Number(b.amount || 0)
    return BILL_TYPES
      .map((bt) => ({ label: lang === 'vi' ? bt.vi : bt.en, value: byType[bt.key] || 0, color: BILL_COLORS[bt.key] || '#94a3b8' }))
      .filter((s) => s.value > 0)
  }, [bills, lang])

  const debtSlices = useMemo(() => {
    const byType = {}
    for (const d of debts) byType[d.type] = (byType[d.type] || 0) + Number(d.balance || 0)
    return DEBT_TYPES
      .map((dt) => ({ label: lang === 'vi' ? dt.vi : dt.en, value: byType[dt.key] || 0, color: DEBT_COLORS[dt.key] || '#94a3b8' }))
      .filter((s) => s.value > 0)
  }, [debts, lang])

  return (
    <div className="container-app py-6 sm:py-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">{t.personal.title}</h1>
        <p className="text-ink-500 mt-1">{t.personal.sub}</p>
      </header>

      <section className="mt-6 grid sm:grid-cols-3 gap-4">
        <StatCard label={t.personal.totalBills} value={fmtUSD(totalBills)} tone="ink" icon={Wallet} sublabel="/ month" />
        <StatCard label={t.personal.totalDebt} value={fmtUSD(totalDebt)} tone="rose" icon={CreditCard} />
        <StatCard
          label={t.personal.nextDue}
          value={nextDue ? 'Day ' + nextDue.dueDay : '—'}
          sublabel={nextDue ? nextDue.name + ' • ' + fmtUSD(nextDue.amount) : t.common.none}
          tone="gold"
          icon={Bell}
        />
      </section>

      {/* Charts */}
      <section className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader icon={PieChart} title={lang === 'vi' ? 'Cơ cấu hóa đơn / Bill mix' : 'Bill mix / Cơ cấu hóa đơn'} />
          {billSlices.length === 0 ? (
            <p className="text-sm text-ink-400 py-10 text-center">{t.common.none}</p>
          ) : (
            <DonutChart slices={billSlices} centerLabel={fmtUSD(totalBills)} centerSub="/ mo" />
          )}
        </div>
        <div className="card p-5">
          <SectionHeader icon={PieChart} title={lang === 'vi' ? 'Cơ cấu nợ / Debt mix' : 'Debt mix / Cơ cấu nợ'} />
          {debtSlices.length === 0 ? (
            <p className="text-sm text-ink-400 py-10 text-center">{t.common.none}</p>
          ) : (
            <DonutChart slices={debtSlices} centerLabel={fmtUSD(totalDebt)} centerSub="total" />
          )}
        </div>
      </section>

      <section className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader icon={Home} title={t.personal.bills} action={
            <button onClick={() => setShowBill(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {bills.length === 0 ? <Empty label={t.common.none} /> : (
            <ul className="divide-y divide-ink-100">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink-900">{b.name}</p>
                    <p className="text-xs text-ink-500">Day {b.dueDay} • {label(BILL_TYPES, b.type)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{fmtUSD(b.amount)}/mo</span>
                    <button onClick={() => billApi.remove(b.id)} className="text-ink-300 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <SectionHeader icon={CreditCard} title={t.personal.debts} action={
            <button onClick={() => setShowDebt(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {debts.length === 0 ? <Empty label={t.common.none} /> : (
            <ul className="divide-y divide-ink-100">
              {debts.map((d) => (
                <li key={d.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink-900">{d.name}</p>
                    <span className="font-semibold text-rose-700">{fmtUSD(d.balance)}</span>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {label(DEBT_TYPES, d.type)}
                    {d.apr ? ' • ' + d.apr + '% APR' : ''}
                    {d.minPayment ? ' • min ' + fmtUSD(d.minPayment) : ''}
                  </p>
                  <button onClick={() => debtApi.remove(d.id)} className="mt-1 text-xs text-ink-400 hover:text-rose-600 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> {t.common.delete}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <SectionHeader icon={Bell} title={t.personal.reminders} action={
            <button onClick={() => setShowRem(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {reminders.length === 0 ? <Empty label={t.common.none} /> : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-gold-500/10">
                  <AlertCircle className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900 text-sm">{r.title}</p>
                    <p className="text-xs text-ink-500">{r.date}</p>
                  </div>
                  <button onClick={() => remApi.remove(r.id)} className="text-ink-300 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <BillModal open={showBill} onClose={() => setShowBill(false)} onSave={(d) => { billApi.add(d); setShowBill(false) }} />
      <DebtModal open={showDebt} onClose={() => setShowDebt(false)} onSave={(d) => { debtApi.add(d); setShowDebt(false) }} />
      <ReminderModal open={showRem} onClose={() => setShowRem(false)} onSave={(d) => { remApi.add(d); setShowRem(false) }} />
    </div>
  )
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
        <Icon className="w-4 h-4 text-brand-600" /> {title}
      </h2>
      {action}
    </div>
  )
}
function Empty({ label }) {
  return <p className="text-sm text-ink-400 py-6 text-center">{label}</p>
}

function BillModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', amount: '', dueDay: 1, type: 'utilities' })
  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.amount) return
    onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) })
    setForm({ name: '', amount: '', dueDay: 1, type: 'utilities' })
  }
  return (
    <Modal open={open} onClose={onClose} title={t.personal.bills}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t.common.name}</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.common.amount}</label>
            <input type="number" step="0.01" className="input" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Due day</label>
            <input type="number" min="1" max="31" className="input" value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {BILL_TYPES.map((b) => <option key={b.key} value={b.key}>{b.en} / {b.vi}</option>)}
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">{t.common.cancel}</button>
          <button type="submit" className="btn-primary">{t.common.save}</button>
        </div>
      </form>
    </Modal>
  )
}

function DebtModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', type: 'creditCard', balance: '', apr: '', minPayment: '' })
  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.balance) return
    onSave({ ...form, balance: Number(form.balance), apr: Number(form.apr || 0), minPayment: Number(form.minPayment || 0) })
    setForm({ name: '', type: 'creditCard', balance: '', apr: '', minPayment: '' })
  }
  return (
    <Modal open={open} onClose={onClose} title={t.personal.debts}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t.common.name}</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {DEBT_TYPES.map((d) => <option key={d.key} value={d.key}>{d.en} / {d.vi}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Balance</label>
            <input type="number" step="0.01" className="input" value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })} required />
          </div>
          <div>
            <label className="label">APR %</label>
            <input type="number" step="0.01" className="input" value={form.apr}
              onChange={(e) => setForm({ ...form, apr: e.target.value })} />
          </div>
          <div>
            <label className="label">Min /mo</label>
            <input type="number" step="0.01" className="input" value={form.minPayment}
              onChange={(e) => setForm({ ...form, minPayment: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">{t.common.cancel}</button>
          <button type="submit" className="btn-primary">{t.common.save}</button>
        </div>
      </form>
    </Modal>
  )
}

function ReminderModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().slice(0, 10) })
  const submit = (e) => {
    e.preventDefault()
    if (!form.title) return
    onSave(form)
    setForm({ title: '', date: new Date().toISOString().slice(0, 10) })
  }
  return (
    <Modal open={open} onClose={onClose} title={t.personal.reminders}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Property tax due / Đóng thuế nhà" required />
        </div>
        <div>
          <label className="label">{t.common.date}</label>
          <input type="date" className="input" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">{t.common.cancel}</button>
          <button type="submit" className="btn-primary">{t.common.save}</button>
        </div>
      </form>
    </Modal>
  )
}
