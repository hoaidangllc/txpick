import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { emptyIncome } from '../constants.js'
import { Field, TextArea } from './FormFields.jsx'

export default function IncomeModal({ open, onClose, onSave, labels }) {
  const [form, setForm] = useState(emptyIncome)

  async function save() {
    if (!form.source) return
    await onSave(form)
    setForm(emptyIncome)
  }

  return (
    <Modal open={open} onClose={onClose} title={labels.addIncome} footer={<><button className="btn-secondary" onClick={onClose}>{labels.close}</button><button className="btn-primary" onClick={save}>{labels.save}</button></>}>
      <Field label={labels.source} value={form.source} onChange={(value) => setForm({ ...form, source: value })} />
      <label className="block mb-3">
        <span className="label">{labels.category}</span>
        <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {Object.entries(labels.incomeCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <Field label={labels.amount} type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
      <Field label={labels.date} type="date" value={form.record_date} onChange={(value) => setForm({ ...form, record_date: value })} />
      <TextArea label={labels.notes} value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
    </Modal>
  )
}
