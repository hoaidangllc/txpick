import { useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { emptyIncome } from './taxConstants.js'
import { TaxField, TaxTextArea } from './TaxField.jsx'

export default function TaxIncomeModal({ open, onClose, onSave, c }) {
  const [form, setForm] = useState(emptyIncome)

  const save = async () => {
    if (!form.source) return
    await onSave(form)
    setForm(emptyIncome)
  }

  return (
    <Modal open={open} onClose={onClose} title={c.addIncome} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <TaxField label={c.source} value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
      <label className="block mb-3">
        <span className="label">{c.category}</span>
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {Object.entries(c.incomeCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <TaxField label={c.amount} type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
      <TaxField label={c.date} type="date" value={form.record_date} onChange={(v) => setForm({ ...form, record_date: v })} />
      <TaxTextArea label={c.notes} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </Modal>
  )
}
