import { Download, FileText } from 'lucide-react'

export default function TaxHeader({ c, canExportWorkers, canExportIncome, canExportExpenses, onExportWorkers, onExportIncome, onExportExpenses, onExportPdf }) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><FileText className="w-7 h-7 text-brand-600" /> {c.title}</h1>
        <p className="text-ink-500 mt-1 max-w-4xl">{c.sub}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="btn-secondary" onClick={onExportWorkers} disabled={!canExportWorkers}><Download className="w-4 h-4" /> {c.exportWorkers}</button>
        <button className="btn-secondary" onClick={onExportIncome} disabled={!canExportIncome}><Download className="w-4 h-4" /> {c.exportIncome}</button>
        <button className="btn-secondary" onClick={onExportExpenses} disabled={!canExportExpenses}><Download className="w-4 h-4" /> {c.exportExpenses}</button>
        <button className="btn-primary" onClick={onExportPdf}><Download className="w-4 h-4" /> {c.exportPdf}</button>
      </div>
    </div>
  )
}
