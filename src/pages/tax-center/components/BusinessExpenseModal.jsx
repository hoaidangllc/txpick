import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { todayISO } from '../../../lib/lifeStore.js'
import { businessExpenseGroups } from '../constants.js'
import { Field, TextArea } from './FormFields.jsx'

const initial = { title: '', amount: '', category: 'supplies', date: todayISO(), note: '' }

export default function BusinessExpenseModal({ open, onClose, onSave, labels }) {
  const [form, setForm] = useState(initial)

  async function save() {
    if (!form.title || !form.amount) return
    await onSave({ ...form, amount: Number(form.amount), expense_type: 'business' })
    setForm(initial)
  }

  return (
    <Modal open={open} onClose={onClose} title={labels.addExpense} footer={<><button className="btn-secondary" onClick={onClose}>{labels.close}</button><button className="btn-primary" onClick={save}>{labels.save}</button></>}>
      <Field label={labels.expenseName} value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
      <Field label={labels.amount} type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
      <label className="block mb-3">
        <span className="label">{labels.category}</span>
        <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {businessExpenseGroups.map((item) => <option key={item.key} value={item.key}>{labels.expenseCategories[item.key] || item.en}</option>)}
        </select>
      </label>
      <Field label={labels.date} type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
      <TextArea label={labels.notes} value={form.note} onChange={(value) => setForm({ ...form, note: value })} />
    </Modal>
  )
}
