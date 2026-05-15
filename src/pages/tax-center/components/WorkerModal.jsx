import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { fmtUSD } from '../../../lib/lifeStore.js'
import { emptyWorker } from '../constants.js'
import { money } from '../utils/taxMath.js'
import { Field, TextArea } from './FormFields.jsx'

export default function WorkerModal({ open, onClose, onSave, labels }) {
  const [form, setForm] = useState(emptyWorker)
  const total = money(form.work_pay) + money(form.tips)

  async function save() {
    if (!form.name) return
    await onSave(form)
    setForm(emptyWorker)
  }

  return (
    <Modal open={open} onClose={onClose} title={labels.addWorker} footer={<><button className="btn-secondary" onClick={onClose}>{labels.close}</button><button className="btn-primary" onClick={save}>{labels.save}</button></>}>
      <label className="block mb-3">
        <span className="label">{labels.type}</span>
        <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          <option value="1099">1099</option>
          <option value="W2">W2</option>
        </select>
      </label>
      <Field label={labels.name} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
      <Field label={labels.ssn} value={form.ssn} onChange={(value) => setForm({ ...form, ssn: value })} />
      <Field label={labels.address} value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={labels.workPay} type="number" value={form.work_pay} onChange={(value) => setForm({ ...form, work_pay: value })} />
        <Field label={labels.tips} type="number" value={form.tips} onChange={(value) => setForm({ ...form, tips: value })} />
      </div>
      <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 mb-3 flex justify-between font-bold text-brand-800">
        <span>{labels.total}</span><span>{fmtUSD(total)}</span>
      </div>
      <Field label={labels.year} type="number" value={form.tax_year} onChange={(value) => setForm({ ...form, tax_year: value })} />
      <TextArea label={labels.notes} value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
    </Modal>
  )
}
