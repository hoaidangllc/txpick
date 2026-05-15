import { useMemo, useState } from 'react'
import { Plus, Receipt, Trash2, Wallet } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import {
  EXPENSE_CATEGORIES, fmtUSD, isCurrentMonth, todayISO,
  categoryLabel,
} from '../lib/lifeStore.js'
import { expensesDb, useRemoteCollection } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Chi tiêu',
    sub: 'Ghi tay nhanh gọn — không cần scan hình, app vẫn nhẹ và dễ dùng mỗi ngày.',
    add: 'Thêm', thisMonth: 'Tháng này', business: 'Kinh doanh', personal: 'Cá nhân / khác',
    list: 'Danh sách chi tiêu',
    empty: 'Chưa có chi tiêu nào. Nhập khoản đầu tiên để theo dõi cả tháng.',
    modal: 'Thêm chi tiêu', close: 'Đóng', save: 'Lưu',
    name: 'Tên chi tiêu', amount: 'Số tiền', category: 'Phân loại', date: 'Ngày', note: 'Ghi chú',
    none: '—',
  },
  en: {
    title: 'Expenses',
    sub: 'Fast manual entry — no photo scan, keeping the app light and affordable.',
    add: 'Add', thisMonth: 'This month', business: 'Business', personal: 'Personal / Other',
    list: 'Expense list',
    empty: 'No expenses yet. Add your first to start tracking the month.',
    modal: 'Add expense', close: 'Cancel', save: 'Save',
    name: 'Title', amount: 'Amount', category: 'Category', date: 'Date', note: 'Note',
    none: '—',
  },
}

export default function Expenses() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [items, api, state] = useRemoteCollection(user?.id, expensesDb)
  const [open, setOpen] = useState(false)
  const monthItems = useMemo(() => items.filter((x) => isCurrentMonth(x.date)), [items])
  const total = monthItems.reduce((s, e) => s + Number(e.amount || 0), 0)
  const business = monthItems.filter((e) => ['business', 'salon', 'supply'].includes(e.category)).reduce((s, e) => s + Number(e.amount || 0), 0)

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> {c.add}
        </button>
      </div>

      <section className="mt-5 grid sm:grid-cols-3 gap-3">
        <StatCard label={c.thisMonth} value={total ? fmtUSD(total) : c.none} icon={Wallet} tone="brand" />
        <StatCard label={c.business} value={business ? fmtUSD(business) : c.none} />
        <StatCard label={c.personal} value={total - business ? fmtUSD(total - business) : c.none} />
      </section>

      <div className="mt-5 card p-5">
        <h2 className="font-bold text-ink-900">{c.list}</h2>
        {state.loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Đang tải…</p>
        ) : state.error ? (
          <p className="py-10 text-center text-sm text-rose-600">{state.error}</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">{c.empty}</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {items.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{e.title}</p>
                  <p className="text-xs text-ink-500">{e.date} • {categoryLabel(e.category, lang, EXPENSE_CATEGORIES)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink-900">{fmtUSD(e.amount)}</span>
                  <button onClick={() => api.remove(e.id)} className="text-ink-300 hover:text-rose-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ExpenseModal open={open} onClose={() => setOpen(false)} onSave={(item) => { api.add(item); setOpen(false) }} c={c} lang={lang} />
    </div>
  )
}

function ExpenseModal({ open, onClose, onSave, c, lang }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' })
  const save = () => { if (!form.title || !form.amount) return; onSave({ ...form, amount: Number(form.amount) }); setForm({ title: '', amount: '', category: 'personal', date: todayISO(), note: '' }) }
  return (
    <Modal open={open} onClose={onClose} title={c.modal} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <Field label={c.name} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <label className="label">{c.category}</label>
      <select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {EXPENSE_CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang, EXPENSE_CATEGORIES)}</option>)}
      </select>
      <Field label={c.date} type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
      <Field label={c.note} value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
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
