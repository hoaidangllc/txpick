import { useMemo, useState } from 'react'
import { CheckCircle2, Plus, RotateCcw, Trash2, WalletCards } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { CATEGORIES, fmtUSD, categoryLabel } from '../lib/lifeStore.js'
import { billsDb, useRemoteCollection } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Hóa đơn hằng tháng',
    sub: 'Nhập một lần, app nhắc đúng ngày. Điện, nước, internet, tiền nhà, bảo hiểm — gom chung một chỗ.',
    add: 'Thêm hóa đơn',
    emptyTitle: 'Chưa có hóa đơn nào',
    empty: 'Thêm điện, nước, internet, tiền nhà… để app nhắc đúng ngày mỗi tháng.',
    due: 'Ngày',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    markPaid: 'Đánh dấu đã trả',
    reopen: 'Mở lại hóa đơn',
    modal: 'Thêm hóa đơn hằng tháng',
    close: 'Đóng',
    save: 'Lưu',
    name: 'Tên hóa đơn',
    amount: 'Số tiền',
    dueDay: 'Ngày đến hạn trong tháng',
    category: 'Phân loại',
    monthly: 'Tổng mỗi tháng',
    count: 'Số hóa đơn',
    none: '—',
    delete: 'Xóa hóa đơn',
    loading: 'Đang tải…',
  },
  en: {
    title: 'Monthly bills',
    sub: 'Enter once, get reminded on time. Power, water, internet, rent, insurance — all in one place.',
    add: 'Add bill',
    emptyTitle: 'No bills yet',
    empty: 'Add power, water, internet, rent… and the app will remind you each month.',
    due: 'Day',
    paid: 'Paid',
    unpaid: 'Unpaid',
    markPaid: 'Mark paid',
    reopen: 'Reopen bill',
    modal: 'Add monthly bill',
    close: 'Cancel',
    save: 'Save',
    name: 'Bill name',
    amount: 'Amount',
    dueDay: 'Due day of month',
    category: 'Category',
    monthly: 'Monthly total',
    count: 'Bills',
    none: '—',
    delete: 'Delete bill',
    loading: 'Loading…',
  },
}

export default function Bills() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [items, api, state] = useRemoteCollection(user?.id, billsDb)
  const [open, setOpen] = useState(false)
  const total = useMemo(() => items.reduce((s, b) => s + Number(b.amount || 0), 0), [items])

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <WalletCards className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {c.add}
        </button>
      </div>

      <section className="mt-5 grid sm:grid-cols-2 gap-3">
        <StatCard label={c.monthly} value={total ? fmtUSD(total) : c.none} icon={WalletCards} tone="brand" />
        <StatCard label={c.count} value={items.length || c.none} />
      </section>

      <div className="mt-5 card p-5">
        {state.loading ? (
          <p className="py-10 text-center text-sm text-ink-400">{c.loading}</p>
        ) : state.error ? (
          <p className="py-10 text-center text-sm text-rose-600">{state.error}</p>
        ) : items.length === 0 ? (
          <EmptyBills c={c} onAdd={() => setOpen(true)} />
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((b) => (
              <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 truncate">{b.name || b.title}</p>
                  <p className="text-xs text-ink-500">
                    {c.due} {b.dueDay} • {categoryLabel(b.category, lang)} • {b.paid ? c.paid : c.unpaid}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-ink-900">{fmtUSD(b.amount)}</span>
                  {b.paid ? (
                    <button
                      onClick={() => api.update(b.id, { paid: false, paid_at: null })}
                      className="text-ink-400 hover:text-brand-700"
                      aria-label={c.reopen}
                      title={c.reopen}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => api.update(b.id, { paid: true, paid_at: new Date().toISOString() })}
                      className="text-brand-600 hover:text-brand-800"
                      aria-label={c.markPaid}
                      title={c.markPaid}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => api.remove(b.id)} className="text-ink-300 hover:text-rose-600" aria-label={c.delete} title={c.delete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BillModal open={open} onClose={() => setOpen(false)} onSave={(item) => { api.add(item); setOpen(false) }} c={c} lang={lang} />
    </div>
  )
}

function EmptyBills({ c, onAdd }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <WalletCards className="w-6 h-6" />
      </div>
      <h3 className="mt-3 font-bold text-ink-900">{c.emptyTitle}</h3>
      <p className="mt-1 text-sm text-ink-500 max-w-md mx-auto">{c.empty}</p>
      <button onClick={onAdd} className="btn-primary mt-4">
        <Plus className="w-4 h-4" /> {c.add}
      </button>
    </div>
  )
}

function BillModal({ open, onClose, onSave, c, lang }) {
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '1', category: 'bill' })
  const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', dueDay: '1', category: 'bill' }) }
  return (
    <Modal open={open} onClose={onClose} title={c.modal} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <Field label={c.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <Field label={c.dueDay} type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} />
      <label className="label">{c.category}</label>
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang)}</option>)}
      </select>
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
