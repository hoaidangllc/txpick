import { useCallback, useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, Download, FileText, Plus, Trash2, UserRound, WalletCards } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { supabase } from '../lib/supabase.js'
import { fmtUSD, todayISO } from '../lib/lifeStore.js'
import { downloadCSV, downloadSimplePDF } from '../lib/exporters.js'

const currentYear = new Date().getFullYear()

const emptyWorker = {
  type: '1099',
  name: '',
  ssn: '',
  address: '',
  work_pay: '',
  tips: '',
  tax_year: currentYear,
  notes: '',
}

const emptyIncome = {
  source: '',
  category: 'salon_income',
  amount: '',
  record_date: todayISO(),
  notes: '',
}

const copy = {
  vi: {
    title: 'Thuế cuối năm',
    sub: 'Dành cho chủ tiệm và business: nhập thông tin thợ W2/1099, tiền làm, tiền tip, income và chi tiêu để cuối năm xuất file đưa cho người làm thuế.',
    workers: 'Thợ / nhân viên W2 & 1099',
    addWorker: 'Thêm thợ / nhân viên',
    income: 'Income của business',
    addIncome: 'Thêm income',
    expenses: 'Chi tiêu business',
    export: 'Xuất file cho thuế',
    exportWorkers: 'Xuất thợ CSV',
    exportIncome: 'Xuất income CSV',
    exportExpenses: 'Xuất chi tiêu CSV',
    exportPdf: 'Xuất PDF tổng kết',
    save: 'Lưu',
    close: 'Đóng',
    delete: 'Xóa',
    type: 'Loại',
    name: 'Tên thợ / nhân viên',
    ssn: 'SSN hoặc EIN',
    address: 'Địa chỉ',
    workPay: 'Tiền làm',
    tips: 'Tiền tip',
    total: 'Tổng cộng',
    year: 'Năm thuế',
    notes: 'Ghi chú',
    source: 'Nguồn income',
    category: 'Loại income',
    amount: 'Số tiền',
    date: 'Ngày',
    emptyWorkers: 'Chưa có thợ hoặc nhân viên nào.',
    emptyIncome: 'Chưa có income business nào.',
    emptyExpenses: 'Chưa có chi tiêu business trong năm nay.',
    businessIncome: 'Income business',
    workerTotal: 'Tiền trả thợ',
    businessExpenseTotal: 'Chi tiêu business',
    netBusiness: 'Ước tính còn lại',
    warning: 'Thông tin SSN/EIN rất nhạy cảm. Chỉ nhập khi bạn thật sự cần xuất file cho người làm thuế, và bảo vệ tài khoản Google/Supabase kỹ.',
    runSql: 'Nếu trang này báo thiếu bảng/cột, chạy file supabase/migration_004_tax_worker_income.sql trong Supabase trước.',
    incomeCategories: {
      salon_income: 'Income tiệm nail',
      booth_rent: 'Booth rent',
      uber: 'Uber',
      doordash: 'DoorDash',
      other_business: 'Business khác',
    },
  },
  en: {
    title: 'Year-End Tax Center',
    sub: 'For salon owners and business users: enter W2/1099 worker info, SSN/EIN, address, work pay, tips, business income, and expenses so you can export files for your tax preparer.',
    workers: 'W2 & 1099 workers',
    addWorker: 'Add worker',
    income: 'Business income',
    addIncome: 'Add income',
    expenses: 'Business expenses',
    export: 'Tax exports',
    exportWorkers: 'Export workers CSV',
    exportIncome: 'Export income CSV',
    exportExpenses: 'Export expenses CSV',
    exportPdf: 'Export PDF summary',
    save: 'Save',
    close: 'Cancel',
    delete: 'Delete',
    type: 'Type',
    name: 'Worker / employee name',
    ssn: 'SSN or EIN',
    address: 'Address',
    workPay: 'Work pay',
    tips: 'Tips',
    total: 'Total',
    year: 'Tax year',
    notes: 'Notes',
    source: 'Income source',
    category: 'Income type',
    amount: 'Amount',
    date: 'Date',
    emptyWorkers: 'No W2 or 1099 workers yet.',
    emptyIncome: 'No business income yet.',
    emptyExpenses: 'No business expenses recorded this year.',
    businessIncome: 'Business income',
    workerTotal: 'Worker payments',
    businessExpenseTotal: 'Business expenses',
    netBusiness: 'Estimated net',
    warning: 'SSN/EIN is sensitive information. Only enter it if you need it for tax export, and protect your Google/Supabase account carefully.',
    runSql: 'If this page says tables/columns are missing, run supabase/migration_004_tax_worker_income.sql in Supabase first.',
    incomeCategories: {
      salon_income: 'Nail salon income',
      booth_rent: 'Booth rent',
      uber: 'Uber',
      doordash: 'DoorDash',
      other_business: 'Other business',
    },
  },
}

function money(value) {
  return Number(value || 0)
}

function workerTotal(row) {
  return money(row.work_pay ?? row.wages ?? row.payments) + money(row.tips)
}

function addressFrom(row) {
  return row.address || [row.street, row.city, row.state, row.zip].filter(Boolean).join(', ')
}

function isBusinessExpense(e) {
  return e.expense_type === 'business' || ['business', 'salon', 'supply', 'supplies', 'marketing', 'transportation', 'utility', 'rent', 'payroll'].includes(e.category)
}

export default function TaxCenter() {
  const { user } = useAuth()
  const { lang } = useLang()
  const c = copy[lang]
  const year = currentYear

  const [w2Rows, setW2Rows] = useState([])
  const [contractors, setContractors] = useState([])
  const [incomeRows, setIncomeRows] = useState([])
  const [expenses, setExpenses] = useState([])
  const [workerOpen, setWorkerOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const allWorkers = useMemo(() => [
    ...w2Rows.map((row) => ({ ...row, type: 'W2', tax_id: row.ssn || row.ssn_text || row.ssn_last4 })),
    ...contractors.map((row) => ({ ...row, type: '1099', tax_id: row.tin || row.tin_text || row.tin_last4 })),
  ].filter((row) => Number(row.tax_year || year) === year), [w2Rows, contractors, year])

  const businessExpenses = useMemo(() => expenses.filter((e) => {
    const d = String(e.expense_date || e.date || '')
    return d.startsWith(String(year)) && isBusinessExpense(e)
  }), [expenses, year])

  const totals = useMemo(() => {
    const workerPay = allWorkers.reduce((sum, row) => sum + workerTotal(row), 0)
    const income = incomeRows
      .filter((row) => String(row.record_date || '').startsWith(String(year)))
      .reduce((sum, row) => sum + money(row.amount), 0)
    const expense = businessExpenses.reduce((sum, row) => sum + money(row.amount), 0)
    return { workerPay, income, expense, net: income - expense - workerPay }
  }, [allWorkers, incomeRows, businessExpenses, year])

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const [w2, c1099, income, exp] = await Promise.all([
        supabase.from('biz_workers_w2').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('biz_workers_1099').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('biz_income_records').select('*').eq('user_id', user.id).order('record_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('profile_id', user.id).order('expense_date', { ascending: false }),
      ])
      if (w2.error) throw w2.error
      if (c1099.error) throw c1099.error
      if (income.error) throw income.error
      if (exp.error) throw exp.error
      setW2Rows(w2.data || [])
      setContractors(c1099.data || [])
      setIncomeRows(income.data || [])
      setExpenses(exp.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load tax records')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadData() }, [loadData])

  async function addWorker(form) {
    const total = money(form.work_pay) + money(form.tips)
    if (form.type === 'W2') {
      const payload = {
        user_id: user.id,
        name: form.name,
        ssn: form.ssn || null,
        ssn_text: form.ssn || null,
        ssn_last4: String(form.ssn || '').slice(-4),
        address: form.address || null,
        street: form.address || null,
        work_pay: money(form.work_pay),
        tips: money(form.tips),
        total_pay: total,
        wages: total,
        tax_year: Number(form.tax_year || year),
        notes: form.notes || null,
      }
      const { data, error: insertError } = await supabase.from('biz_workers_w2').insert(payload).select('*').single()
      if (insertError) throw insertError
      setW2Rows((prev) => [data, ...prev])
      return
    }

    const payload = {
      user_id: user.id,
      name: form.name,
      tin: form.ssn || null,
      tin_text: form.ssn || null,
      tin_last4: String(form.ssn || '').slice(-4),
      address: form.address || null,
      street: form.address || null,
      work_pay: money(form.work_pay),
      tips: money(form.tips),
      total_pay: total,
      payments: total,
      tax_year: Number(form.tax_year || year),
      notes: form.notes || null,
    }
    const { data, error: insertError } = await supabase.from('biz_workers_1099').insert(payload).select('*').single()
    if (insertError) throw insertError
    setContractors((prev) => [data, ...prev])
  }

  async function addIncome(form) {
    const payload = {
      user_id: user.id,
      source: form.source,
      category: form.category || 'salon_income',
      amount: money(form.amount),
      record_date: form.record_date || todayISO(),
      notes: form.notes || null,
    }
    const { data, error: insertError } = await supabase.from('biz_income_records').insert(payload).select('*').single()
    if (insertError) throw insertError
    setIncomeRows((prev) => [data, ...prev])
  }

  async function removeWorker(row) {
    const table = row.type === 'W2' ? 'biz_workers_w2' : 'biz_workers_1099'
    const { error: deleteError } = await supabase.from(table).delete().eq('id', row.id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    if (row.type === 'W2') setW2Rows((prev) => prev.filter((x) => x.id !== row.id))
    else setContractors((prev) => prev.filter((x) => x.id !== row.id))
  }

  async function removeIncome(id) {
    const { error: deleteError } = await supabase.from('biz_income_records').delete().eq('id', id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    setIncomeRows((prev) => prev.filter((x) => x.id !== id))
  }

  function exportWorkers() {
    downloadCSV(`tax-workers-${year}.csv`, [
      ['Type', 'Name', 'SSN/EIN', 'Address', 'Work Pay', 'Tips', 'Total', 'Tax Year', 'Notes'],
      ...allWorkers.map((x) => [x.type, x.name, x.tax_id, addressFrom(x), money(x.work_pay ?? x.wages ?? x.payments), money(x.tips), workerTotal(x), x.tax_year, x.notes]),
    ])
  }

  function exportIncome() {
    downloadCSV(`business-income-${year}.csv`, [
      ['Date', 'Source', 'Category', 'Amount', 'Notes'],
      ...incomeRows.filter((x) => String(x.record_date || '').startsWith(String(year))).map((x) => [x.record_date, x.source, x.category, x.amount, x.notes]),
    ])
  }

  function exportExpenses() {
    downloadCSV(`business-expenses-${year}.csv`, [
      ['Date', 'Title', 'Category', 'Amount', 'Notes'],
      ...businessExpenses.map((x) => [x.expense_date || x.date, x.title, x.category, x.amount, x.notes || x.note]),
    ])
  }

  function exportPdf() {
    downloadSimplePDF(`business-tax-summary-${year}.pdf`, lang === 'vi' ? `Tổng kết thuế business ${year}` : `Business Tax Summary ${year}`, [
      `${c.businessIncome}: ${fmtUSD(totals.income)}`,
      `${c.workerTotal}: ${fmtUSD(totals.workerPay)}`,
      `${c.businessExpenseTotal}: ${fmtUSD(totals.expense)}`,
      `${c.netBusiness}: ${fmtUSD(totals.net)}`,
      `${c.workers}: ${allWorkers.length}`,
      `${c.income}: ${incomeRows.length}`,
      `${c.expenses}: ${businessExpenses.length}`,
      `Generated: ${todayISO()}`,
    ])
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-4xl">{c.sub}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary" onClick={exportWorkers} disabled={allWorkers.length === 0}><Download className="w-4 h-4" /> {c.exportWorkers}</button>
          <button className="btn-secondary" onClick={exportIncome} disabled={incomeRows.length === 0}><Download className="w-4 h-4" /> {c.exportIncome}</button>
          <button className="btn-secondary" onClick={exportExpenses} disabled={businessExpenses.length === 0}><Download className="w-4 h-4" /> {c.exportExpenses}</button>
          <button className="btn-primary" onClick={exportPdf}><Download className="w-4 h-4" /> {c.exportPdf}</button>
        </div>
      </div>

      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.warning}</p>
      {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}<br />{c.runSql}</p>}

      <section className="mt-5 grid sm:grid-cols-4 gap-3">
        <StatCard label={c.businessIncome} value={fmtUSD(totals.income)} icon={WalletCards} tone="brand" />
        <StatCard label={c.workerTotal} value={fmtUSD(totals.workerPay)} icon={UserRound} />
        <StatCard label={c.businessExpenseTotal} value={fmtUSD(totals.expense)} icon={BriefcaseBusiness} />
        <StatCard label={c.netBusiness} value={fmtUSD(totals.net)} icon={FileText} />
      </section>

      <section className="mt-5 grid lg:grid-cols-2 gap-5">
        <WorkersCard c={c} rows={allWorkers} loading={loading} onAdd={() => setWorkerOpen(true)} onRemove={removeWorker} />
        <IncomeCard c={c} rows={incomeRows.filter((x) => String(x.record_date || '').startsWith(String(year)))} loading={loading} onAdd={() => setIncomeOpen(true)} onRemove={removeIncome} />
      </section>

      <section className="mt-5 card p-5">
        <h2 className="text-lg font-bold text-ink-900">{c.expenses}</h2>
        {businessExpenses.length === 0 ? (
          <p className="py-8 text-sm text-ink-400">{c.emptyExpenses}</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {businessExpenses.slice(0, 12).map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{e.title}</p>
                  <p className="text-xs text-ink-500">{e.expense_date || e.date} • {e.category}</p>
                </div>
                <span className="font-bold text-ink-900">{fmtUSD(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WorkerModal open={workerOpen} onClose={() => setWorkerOpen(false)} onSave={async (form) => { await addWorker(form); setWorkerOpen(false) }} c={c} />
      <IncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} onSave={async (form) => { await addIncome(form); setIncomeOpen(false) }} c={c} />
    </div>
  )
}

function WorkersCard({ c, rows, loading, onAdd, onRemove }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{c.workers}</h2>
        <button className="btn-primary !py-2 text-sm" onClick={onAdd}><Plus className="w-4 h-4" /> {c.addWorker}</button>
      </div>
      {loading ? <p className="py-10 text-center text-sm text-ink-400">Loading…</p> : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">{c.emptyWorkers}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.map((row) => (
            <li key={`${row.type}-${row.id}`} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{row.name}</p>
                <p className="text-xs text-ink-500">{row.type} • {c.workPay}: {fmtUSD(row.work_pay ?? row.wages ?? row.payments)} • {c.tips}: {fmtUSD(row.tips)}</p>
                <p className="text-xs text-ink-400 truncate max-w-[320px]">{addressFrom(row) || '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink-900">{fmtUSD(workerTotal(row))}</span>
                <button className="text-ink-300 hover:text-rose-600" onClick={() => onRemove(row)} aria-label={c.delete}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IncomeCard({ c, rows, loading, onAdd, onRemove }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{c.income}</h2>
        <button className="btn-primary !py-2 text-sm" onClick={onAdd}><Plus className="w-4 h-4" /> {c.addIncome}</button>
      </div>
      {loading ? <p className="py-10 text-center text-sm text-ink-400">Loading…</p> : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">{c.emptyIncome}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.map((row) => (
            <li key={row.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{row.source}</p>
                <p className="text-xs text-ink-500">{row.record_date} • {c.incomeCategories[row.category] || row.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink-900">{fmtUSD(row.amount)}</span>
                <button className="text-ink-300 hover:text-rose-600" onClick={() => onRemove(row.id)} aria-label={c.delete}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WorkerModal({ open, onClose, onSave, c }) {
  const [form, setForm] = useState(emptyWorker)
  const total = money(form.work_pay) + money(form.tips)
  const save = async () => {
    if (!form.name) return
    await onSave(form)
    setForm(emptyWorker)
  }
  return (
    <Modal open={open} onClose={onClose} title={c.addWorker} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <label className="block mb-3">
        <span className="label">{c.type}</span>
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="1099">1099</option>
          <option value="W2">W2</option>
        </select>
      </label>
      <Field label={c.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label={c.ssn} value={form.ssn} onChange={(v) => setForm({ ...form, ssn: v })} />
      <Field label={c.address} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={c.workPay} type="number" value={form.work_pay} onChange={(v) => setForm({ ...form, work_pay: v })} />
        <Field label={c.tips} type="number" value={form.tips} onChange={(v) => setForm({ ...form, tips: v })} />
      </div>
      <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 mb-3 flex justify-between font-bold text-brand-800">
        <span>{c.total}</span><span>{fmtUSD(total)}</span>
      </div>
      <Field label={c.year} type="number" value={form.tax_year} onChange={(v) => setForm({ ...form, tax_year: v })} />
      <TextArea label={c.notes} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </Modal>
  )
}

function IncomeModal({ open, onClose, onSave, c }) {
  const [form, setForm] = useState(emptyIncome)
  const save = async () => {
    if (!form.source) return
    await onSave(form)
    setForm(emptyIncome)
  }
  return (
    <Modal open={open} onClose={onClose} title={c.addIncome} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <Field label={c.source} value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
      <label className="block mb-3">
        <span className="label">{c.category}</span>
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {Object.entries(c.incomeCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <Field label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <Field label={c.date} type="date" value={form.record_date} onChange={(v) => setForm({ ...form, record_date: v })} />
      <TextArea label={c.notes} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <textarea className="input min-h-[80px]" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
