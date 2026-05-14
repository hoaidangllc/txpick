import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Trash2, Wallet } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, CATEGORIES, fmtUSD } from '../lib/lifeStore.js'
import { categoryLabel, textFor } from '../lib/uiText.js'

export default function Bills() {
  const { lang } = useLang()
  const ui = textFor(lang)
  const [items, api] = useLocalStore(STORAGE_KEYS.bills, [])
  const [open, setOpen] = useState(false)
  const total = useMemo(() => items.reduce((s, x) => s + Number(x.amount || 0), 0), [items])
  const dueSoon = useMemo(() => items.filter((b) => ((Number(b.dueDay || 1) - new Date().getDate() + 31) % 31) <= 5), [items])
  return <div className="container-app py-6 sm:py-8"><div className="flex items-end justify-between gap-3"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><CalendarDays className="w-7 h-7 text-brand-600" /> {ui.bills.title}</h1><p className="text-ink-500 mt-1">{ui.bills.subtitle}</p></div><button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> {ui.common.add}</button></div><section className="mt-5 grid sm:grid-cols-3 gap-3"><StatCard label={ui.bills.total} value={fmtUSD(total)} icon={Wallet} tone="brand" /><StatCard label={ui.bills.bills} value={items.length} /><StatCard label={ui.bills.dueSoon} value={dueSoon.length} tone="gold" /></section><div className="mt-5 card p-5"><h2 className="font-bold text-ink-900">{ui.bills.list}</h2>{items.length === 0 ? <p className="py-10 text-center text-sm text-ink-400">{ui.bills.empty}</p> : <ul className="mt-3 divide-y divide-ink-100">{items.map((b) => <li key={b.id} className="py-3 flex items-center justify-between gap-3"><div><p className="font-semibold text-ink-900">{b.name}</p><p className="text-xs text-ink-500">{ui.bills.dueDayShort} {b.dueDay} • {categoryLabel(b.category, lang)}</p></div><div className="flex items-center gap-3"><span className="font-bold text-ink-900">{fmtUSD(b.amount)}/mo</span><button onClick={() => api.remove(b.id)} className="text-ink-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></li>)}</ul>}</div><BillModal open={open} onClose={() => setOpen(false)} onSave={(item) => { api.add(item); setOpen(false) }} lang={lang} /></div>
}
function BillModal({ open, onClose, onSave, lang }) { const ui = textFor(lang); const [form, setForm] = useState({ name: '', amount: '', dueDay: '1', category: 'bill' }); const save = () => { if (!form.name || !form.amount) return; onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }); setForm({ name: '', amount: '', dueDay: '1', category: 'bill' }) }; return <Modal open={open} onClose={onClose} title={ui.bills.addTitle} footer={<><button className="btn-secondary" onClick={onClose}>{ui.common.cancel}</button><button className="btn-primary" onClick={save}>{ui.common.save}</button></>}><Field label={ui.bills.billName} value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Field label={ui.common.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><Field label={ui.bills.dueDay} type="number" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} /><label className="label">{ui.common.category}</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{categoryLabel(c.key, lang)}</option>)}</select></Modal> }
function Field({ label, value, onChange, type = 'text' }) { return <label className="block mb-3"><span className="label">{label}</span><input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label> }
