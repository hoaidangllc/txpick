import { useMemo, useState } from 'react'
import {
  Plus, Receipt, Repeat, Users, UserCheck, Trash2,
  Wallet, TrendingUp, TrendingDown, BarChart3,
} from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { BarChart, DonutChart } from '../components/Chart.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore, fmtUSD, inCurrentMonth } from '../lib/useLocalStore.js'

const CAT_KEYS = ['supply', 'utilities', 'rent', 'food', 'equipment', 'marketing', 'other']
const CAT_COLORS = {
  supply: '#10b981',
  utilities: '#f59e0b',
  rent: '#0ea5e9',
  food: '#ef4444',
  equipment: '#8b5cf6',
  marketing: '#ec4899',
  other: '#64748b',
}

export default function BusinessDashboard() {
  const { t } = useLang()
  const [expenses, exApi] = useLocalStore('txpick_biz_expenses', [])
  const [bills, billApi] = useLocalStore('txpick_biz_bills', [])
  const [workers, wkApi] = useLocalStore('txpick_biz_1099', [])
  const [employees, empApi] = useLocalStore('txpick_biz_w2', [])
  const [income] = useLocalStore('txpick_biz_income_estimate', 12840)

  const [showExpense, setShowExpense] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [showWorker, setShowWorker] = useState(false)
  const [showW2, setShowW2] = useState(false)

  const monthExpenses = useMemo(
    () => expenses.filter((e) => inCurrentMonth(e.date)).reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses],
  )
  const ytdNet = income - expenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  // Last 6 months expense chart
  const monthlySeries = useMemo(() => {
    const now = new Date()
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString(undefined, { month: 'short' })
      const key = `${d.getFullYear()}-${d.getMonth()}`
      buckets.push({ key, label, value: 0, muted: i !== 0 ? false : false })
    }
    for (const e of expenses) {
      const d = new Date(e.date || e.createdAt || Date.now())
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const b = buckets.find((x) => x.key === key)
      if (b) b.value += Number(e.amount || 0)
    }
    return buckets
  }, [expenses])

  // Category breakdown for current month
  const catBreakdown = useMemo(() => {
    const totals = {}
    for (const e of expenses) {
      if (!inCurrentMonth(e.date)) continue
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0)
    }
    return CAT_KEYS
      .map((k) => ({ label: t.business.categories[k], value: totals[k] || 0, color: CAT_COLORS[k] }))
      .filter((s) => s.value > 0)
  }, [expenses, t])

  return (
    <div className="container-app py-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">{t.business.title}</h1>
          <p className="text-ink-500 mt-1">{t.business.sub}</p>
        </div>
        <button onClick={() => setShowExpense(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {t.business.addExpense}
        </button>
      </header>

      <section className="mt-6 grid sm:grid-cols-3 gap-4">
        <StatCard label={t.business.monthIncome} value={fmtUSD(income)} tone="brand" icon={TrendingUp} />
        <StatCard label={t.business.monthExpenses} value={fmtUSD(monthExpenses)} tone="rose" icon={TrendingDown} />
        <StatCard label={t.business.ytdNet} value={fmtUSD(ytdNet)} tone="ink" icon={Wallet} />
      </section>

      {/* Charts */}
      <section className="mt-6 grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <SectionHeader icon={BarChart3} title="Chi phí 6 tháng / Expenses last 6 months" />
          <BarChart data={monthlySeries} emptyLabel="Chưa có dữ liệu" />
        </div>
        <div className="card p-5 lg:col-span-2">
          <SectionHeader icon={Receipt} title="Phân loại tháng này / Category mix this month" />
          {catBreakdown.length === 0 ? (
            <p className="text-sm text-ink-400 py-10 text-center">Chưa có chi phí tháng này.</p>
          ) : (
            <DonutChart
              slices={catBreakdown}
              centerLabel={fmtUSD(monthExpenses)}
              centerSub="this month"
            />
          )}
        </div>
      </section>

      <section className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader icon={Receipt} title={t.business.recentExpenses} action={
            <button onClick={() => setShowExpense(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {expenses.length === 0 ? (
            <Empty label={t.common.none} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {expenses.slice(0, 8).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink-900">{e.note || t.business.categories[e.category]}</p>
                    <p className="text-xs text-ink-500">{e.date} • {t.business.categories[e.category]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">-{fmtUSD(e.amount)}</span>
                    <button onClick={() => exApi.remove(e.id)} className="text-ink-300 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <SectionHeader icon={Repeat} title={t.business.recurringBills} action={
            <button onClick={() => setShowBill(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {bills.length === 0 ? (
            <Empty label={t.common.none} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink-900">{b.name}</p>
                    <p className="text-xs text-ink-500">Day {b.dueDay} • {t.business.categories[b.category]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">{fmtUSD(b.amount)}/mo</span>
                    <button onClick={() => billApi.remove(b.id)} className="text-ink-300 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 1099 workers */}
        <div className="card p-5 lg:col-span-2">
          <SectionHeader icon={Users} title={t.business.workers1099 + ' — Contractors'} action={
            <button onClick={() => setShowWorker(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          {workers.length === 0 ? (
            <Empty label={t.common.none} />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="text-left px-2 py-2">{t.common.name}</th>
                    <th className="text-left px-2 py-2">SSN / TIN</th>
                    <th className="text-left px-2 py-2 hidden md:table-cell">Address / Địa chỉ</th>
                    <th className="text-right px-2 py-2">{t.common.total} YTD</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {workers.map((w) => (
                    <tr key={w.id}>
                      <td className="px-2 py-2.5 font-semibold text-ink-900">{w.name}</td>
                      <td className="px-2 py-2.5 text-ink-500 font-mono text-xs">
                        {w.ssn ? '•••-••-' + w.ssn.slice(-4) : '—'}
                      </td>
                      <td className="px-2 py-2.5 text-ink-500 text-xs hidden md:table-cell">
                        {[w.street, w.city, w.state, w.zip].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold">{fmtUSD(w.amount)}</td>
                      <td className="px-2 py-2.5 text-right">
                        <button onClick={() => wkApi.remove(w.id)} className="text-ink-300 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* W-2 employees */}
        <div className="card p-5 lg:col-span-2">
          <SectionHeader icon={UserCheck} title="Nhân viên W-2 / W-2 Employees" action={
            <button onClick={() => setShowW2(true)} className="btn-ghost text-xs !px-2 !py-1">
              <Plus className="w-3.5 h-3.5" /> {t.common.add}
            </button>
          } />
          <p className="text-xs text-ink-400 mb-3">
            Thợ ăn lương cố định, có trừ thuế. Cuối năm xuất W-2.
            <span className="block">Salaried staff with tax withheld; W-2 form issued at year-end.</span>
          </p>
          {employees.length === 0 ? (
            <Empty label={t.common.none} />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="text-left px-2 py-2">{t.common.name}</th>
                    <th className="text-left px-2 py-2">SSN</th>
                    <th className="text-right px-2 py-2">Wages</th>
                    <th className="text-right px-2 py-2">Fed w/h</th>
                    <th className="text-right px-2 py-2">SS w/h</th>
                    <th className="text-right px-2 py-2">Medicare w/h</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td className="px-2 py-2.5 font-semibold text-ink-900">{e.name}</td>
                      <td className="px-2 py-2.5 text-ink-500 font-mono text-xs">
                        {e.ssn ? '•••-••-' + e.ssn.slice(-4) : '—'}
                      </td>
                      <td className="px-2 py-2.5 text-right">{fmtUSD(e.wages)}</td>
                      <td className="px-2 py-2.5 text-right">{fmtUSD(e.fedWithholding)}</td>
                      <td className="px-2 py-2.5 text-right">{fmtUSD(e.ssWithholding)}</td>
                      <td className="px-2 py-2.5 text-right">{fmtUSD(e.medicareWithholding)}</td>
                      <td className="px-2 py-2.5 text-right">
                        <button onClick={() => empApi.remove(e.id)} className="text-ink-300 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <ExpenseModal open={showExpense} onClose={() => setShowExpense(false)} onSave={(d) => { exApi.add(d); setShowExpense(false) }} />
      <BillModal open={showBill} onClose={() => setShowBill(false)} onSave={(d) => { billApi.add(d); setShowBill(false) }} />
      <WorkerModal open={showWorker} onClose={() => setShowWorker(false)} onSave={(d) => { wkApi.add(d); setShowWorker(false) }} />
      <W2Modal open={showW2} onClose={() => setShowW2(false)} onSave={(d) => { empApi.add(d); setShowW2(false) }} />
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

function ExpenseModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({ amount: '', category: 'supply', date: new Date().toISOString().slice(0, 10), note: '' })
  const submit = (e) => {
    e.preventDefault()
    if (!form.amount) return
    onSave({ ...form, amount: Number(form.amount) })
    setForm({ amount: '', category: 'supply', date: new Date().toISOString().slice(0, 10), note: '' })
  }
  return (
    <Modal open={open} onClose={onClose} title={t.business.addExpense}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.common.amount}</label>
            <input type="number" step="0.01" className="input" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t.common.date}</label>
            <input type="date" className="input" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">{t.common.category}</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CAT_KEYS.map((k) => <option key={k} value={k}>{t.business.categories[k]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t.common.note}</label>
          <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder={t.common.note} />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">{t.common.cancel}</button>
          <button type="submit" className="btn-primary">{t.common.save}</button>
        </div>
      </form>
    </Modal>
  )
}

function BillModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', amount: '', dueDay: 1, category: 'utilities' })
  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.amount) return
    onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) })
    setForm({ name: '', amount: '', dueDay: 1, category: 'utilities' })
  }
  return (
    <Modal open={open} onClose={onClose} title={t.business.recurringBills}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t.common.name}</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.common.amount} /mo</label>
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
          <label className="label">{t.common.category}</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CAT_KEYS.map((k) => <option key={k} value={k}>{t.business.categories[k]}</option>)}
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

function WorkerModal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({
    name: '', ssn: '', amount: '',
    street: '', city: '', state: '', zip: '',
  })
  const submit = (e) => {
    e.preventDefault()
    if (!form.name) return
    onSave({ ...form, amount: Number(form.amount || 0) })
    setForm({ name: '', ssn: '', amount: '', street: '', city: '', state: '', zip: '' })
  }
  return (
    <Modal open={open} onClose={onClose} title="Thợ 1099 / 1099 Contractor">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t.common.name}</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">SSN / TIN <span className="text-ink-400 font-normal">(optional)</span></label>
            <input className="input" value={form.ssn} onChange={(e) => setForm({ ...form, ssn: e.target.value })}
              placeholder="XXX-XX-XXXX" autoComplete="off" />
          </div>
          <div>
            <label className="label">{t.common.total} YTD</label>
            <input type="number" step="0.01" className="input" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>
        <div className="border-t border-ink-100 pt-3">
          <p className="label">Địa chỉ / Address</p>
          <div className="space-y-2">
            <input className="input" placeholder="Street / Đường" value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" placeholder="City / Thành phố" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input" placeholder="State / Bang" maxLength="2" value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
              <input className="input" placeholder="ZIP" value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })} />
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-400">
          Cần đầy đủ SSN + địa chỉ để in 1099-NEC vào cuối năm.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">{t.common.cancel}</button>
          <button type="submit" className="btn-primary">{t.common.save}</button>
        </div>
      </form>
    </Modal>
  )
}

function W2Modal({ open, onClose, onSave }) {
  const { t } = useLang()
  const [form, setForm] = useState({
    name: '', ssn: '',
    wages: '', fedWithholding: '', ssWithholding: '', medicareWithholding: '',
    street: '', city: '', state: '', zip: '',
  })
  const submit = (e) => {
    e.preventDefault()
    if (!form.name) return
    onSave({
      ...form,
      wages: Number(form.wages || 0),
      fedWithholding: Number(form.fedWithholding || 0),
      ssWithholding: Number(form.ssWithholding || 0),
      medicareWithholding: Number(form.medicareWithholding || 0),
    })
    setForm({
      name: '', ssn: '',
      wages: '', fedWithholding: '', ssWithholding: '', medicareWithholding: '',
      street: '', city: '', state: '', zip: '',
    })
  }
  return (
    <Modal open={open} onClose={onClose} title="Nhân viên W-2 / W-2 Employee">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">{t.common.name}</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col-span-2">
            <label className="label">SSN</label>
            <input className="input" value={form.ssn}
              onChange={(e) => setForm({ ...form, ssn: e.target.value })} placeholder="XXX-XX-XXXX" />
          </div>
        </div>
        <div className="border-t border-ink-100 pt-3">
          <p className="label">Lương & Thuế / Wages & Withholding (YTD)</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.01" className="input" placeholder="Wages / Lương"
              value={form.wages} onChange={(e) => setForm({ ...form, wages: e.target.value })} />
            <input type="number" step="0.01" className="input" placeholder="Federal w/h"
              value={form.fedWithholding} onChange={(e) => setForm({ ...form, fedWithholding: e.target.value })} />
            <input type="number" step="0.01" className="input" placeholder="Social Security w/h"
              value={form.ssWithholding} onChange={(e) => setForm({ ...form, ssWithholding: e.target.value })} />
            <input type="number" step="0.01" className="input" placeholder="Medicare w/h"
              value={form.medicareWithholding} onChange={(e) => setForm({ ...form, medicareWithholding: e.target.value })} />
          </div>
        </div>
        <div className="border-t border-ink-100 pt-3">
          <p className="label">Địa chỉ / Address</p>
          <div className="space-y-2">
            <input className="input" placeholder="Street / Đường" value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" placeholder="City" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input" placeholder="State" maxLength="2" value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
              <input className="input" placeholder="ZIP" value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })} />
            </div>
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
