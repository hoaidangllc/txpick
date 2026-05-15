import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import TaxExpensesPreview from './tax-center/TaxExpensesPreview.jsx'
import TaxHeader from './tax-center/TaxHeader.jsx'
import TaxIncomeCard from './tax-center/TaxIncomeCard.jsx'
import TaxIncomeModal from './tax-center/TaxIncomeModal.jsx'
import TaxStats from './tax-center/TaxStats.jsx'
import TaxWorkerModal from './tax-center/TaxWorkerModal.jsx'
import TaxWorkersCard from './tax-center/TaxWorkersCard.jsx'
import { taxCopy } from './tax-center/taxConstants.js'
import { exportExpensesCsv, exportIncomeCsv, exportTaxSummaryPdf, exportWorkersCsv } from './tax-center/taxExports.js'
import { useTaxCenterData } from './tax-center/useTaxCenterData.js'

export default function TaxCenter() {
  const { user } = useAuth()
  const { lang } = useLang()
  const c = taxCopy[lang] || taxCopy.en
  const [workerOpen, setWorkerOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const tax = useTaxCenterData(user)

  const exportContext = {
    year: tax.year,
    lang,
    c,
    totals: tax.totals,
    workers: tax.allWorkers,
    incomeRows: tax.yearIncomeRows,
    expenses: tax.businessExpenses,
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <TaxHeader
        c={c}
        canExportWorkers={tax.allWorkers.length > 0}
        canExportIncome={tax.yearIncomeRows.length > 0}
        canExportExpenses={tax.businessExpenses.length > 0}
        onExportWorkers={() => exportWorkersCsv(exportContext)}
        onExportIncome={() => exportIncomeCsv(exportContext)}
        onExportExpenses={() => exportExpensesCsv(exportContext)}
        onExportPdf={() => exportTaxSummaryPdf(exportContext)}
      />

      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.warning}</p>
      {tax.error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{tax.error}<br />{c.runSql}</p>}

      <TaxStats c={c} totals={tax.totals} />

      <section className="mt-5 grid lg:grid-cols-2 gap-5">
        <TaxWorkersCard c={c} rows={tax.allWorkers} loading={tax.loading} onAdd={() => setWorkerOpen(true)} onRemove={tax.removeWorker} />
        <TaxIncomeCard c={c} rows={tax.yearIncomeRows} loading={tax.loading} onAdd={() => setIncomeOpen(true)} onRemove={tax.removeIncome} />
      </section>

      <TaxExpensesPreview c={c} rows={tax.businessExpenses} />

      <TaxWorkerModal open={workerOpen} onClose={() => setWorkerOpen(false)} onSave={async (form) => { await tax.addWorker(form); setWorkerOpen(false) }} c={c} />
      <TaxIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} onSave={async (form) => { await tax.addIncome(form); setIncomeOpen(false) }} c={c} />
    </div>
  )
}
