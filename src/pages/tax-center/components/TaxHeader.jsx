import { Download, FileText } from 'lucide-react'

export default function TaxHeader({ labels, onExportWorkers, onExportIncome, onExportExpenses, onExportPackage, onExportPdf, disableWorkers, disableIncome, disableExpenses }) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-brand-600" /> {labels.title}
        </h1>
        <p className="text-ink-500 mt-1 max-w-4xl">{labels.sub}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="btn-secondary" onClick={onExportWorkers} disabled={disableWorkers}><Download className="w-4 h-4" /> {labels.exportWorkers}</button>
        <button className="btn-secondary" onClick={onExportIncome} disabled={disableIncome}><Download className="w-4 h-4" /> {labels.exportIncome}</button>
        <button className="btn-secondary" onClick={onExportExpenses} disabled={disableExpenses}><Download className="w-4 h-4" /> {labels.exportExpenses}</button>
        <button className="btn-primary" onClick={onExportPackage}><Download className="w-4 h-4" /> {labels.exportPackage}</button>
        <button className="btn-secondary" onClick={onExportPdf}><Download className="w-4 h-4" /> {labels.exportPdf}</button>
      </div>
    </div>
  )
}
