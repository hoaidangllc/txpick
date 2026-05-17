import { Download, FileText } from 'lucide-react'

export default function TaxHeader({ labels, onExportWorkers, onExportIncome, onExportExpenses, onExportPackage, onExportPdf, disableWorkers, disableIncome, disableExpenses }) {
  return (
    <div className="flex items-start sm:items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-brand-600" /> {labels.title}
        </h1>
        <p className="text-ink-500 mt-1 max-w-4xl">{labels.sub}</p>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
        <button className="btn-secondary !justify-center" onClick={onExportWorkers} disabled={disableWorkers}><Download className="w-4 h-4" /> {labels.exportWorkers}</button>
        <button className="btn-secondary !justify-center" onClick={onExportIncome} disabled={disableIncome}><Download className="w-4 h-4" /> {labels.exportIncome}</button>
        <button className="btn-secondary !justify-center" onClick={onExportExpenses} disabled={disableExpenses}><Download className="w-4 h-4" /> {labels.exportExpenses}</button>
        <button className="btn-primary !justify-center" onClick={onExportPackage}><Download className="w-4 h-4" /> {labels.exportPackage}</button>
        <button className="btn-secondary !justify-center" onClick={onExportPdf}><Download className="w-4 h-4" /> {labels.exportPdf}</button>
      </div>
    </div>
  )
}
