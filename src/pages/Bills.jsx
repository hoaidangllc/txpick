import { useMemo, useState } from 'react'
import { Plus, Trash2, WalletCards } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, CATEGORIES, fmtUSD, categoryLabel } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Hóa đơn',
    sub: 'Theo dõi hóa đơn hằng tháng để không quên ngày đến hạn.',
    add: 'Thêm hóa đơn',
    empty: 'Chưa có hóa đơn nào. Thêm điện, nước, internet, tiền nhà… để app nhắc đúng ngày.',
    due: 'Ngày',
    modal: 'Thêm hóa đơn hằng tháng', close: 'Đóng', save: 'Lưu',
    name: 'Tên hóa đơn', amount: 'Số tiền', dueDay: 'Ngày đến hạn trong tháng', category: 'Phân loại',
    monthly: 'Tổng mỗi tháng', count: 'Số hóa đơn',
    none: '—',
  },
  en: {
    title: 'Bills',
    sub: 'Track monthly bills so due dates never slip.',
    add: 'Add bill',
    empty: 'No bills yet. Add power, water, internet, rent… and the app will remind you on time.',
    due: 'Day',
    modal: 'Add monthly bill', close: 'Cancel', save: 'Save',
    name: 'Bill name', amount: 'Amount', dueDay: 'Due day of month', category: 'Category',
    monthly: 'Monthly total', count: 'Bills',
    none: '—',
  },
}

export default function Bills() {
  const { lang } = useLang()
  const c = copy[lang]
  const [items, api] = useLocalStore(STORAGE_KEYS.bills, [])
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
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">{c.empty}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((b) => (
              <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{b.name}</p>
                  <p className="text-xs text-ink-500">{c.due} {b.dueDay} • {categoryLabel(b.category, lang)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink-900">{fmtUSD(b.amount)}</span>
                  <button onClick={() => api.remove(b.id)} className="text-ink-300 hover:text-rose-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
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
