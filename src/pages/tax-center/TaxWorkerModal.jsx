import { useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { fmtUSD } from '../../lib/lifeStore.js'
import { emptyWorker } from './taxConstants.js'
import { money } from './taxUtils.js'
import { TaxField, TaxTextArea } from './TaxField.jsx'

export default function TaxWorkerModal({ open, onClose, onSave, c }) {
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
      <TaxField label={c.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <TaxField label={c.ssn} value={form.ssn} onChange={(v) => setForm({ ...form, ssn: v })} />
      <TaxField label={c.address} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TaxField label={c.workPay} type="number" value={form.work_pay} onChange={(v) => setForm({ ...form, work_pay: v })} />
        <TaxField label={c.tips} type="number" value={form.tips} onChange={(v) => setForm({ ...form, tips: v })} />
      </div>
      <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 mb-3 flex justify-between font-bold text-brand-800"><span>{c.total}</span><span>{fmtUSD(total)}</span></div>
      <TaxField label={c.year} type="number" value={form.tax_year} onChange={(v) => setForm({ ...form, tax_year: v })} />
      <TaxTextArea label={c.notes} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </Modal>
  )
}
