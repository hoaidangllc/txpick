import { useState } from 'react'
import ExpensesCard from './tax-center/components/ExpensesCard.jsx'
import IncomeCard from './tax-center/components/IncomeCard.jsx'
import IncomeModal from './tax-center/components/IncomeModal.jsx'
import TaxHeader from './tax-center/components/TaxHeader.jsx'
import TaxStats from './tax-center/components/TaxStats.jsx'
import WorkerModal from './tax-center/components/WorkerModal.jsx'
import WorkersCard from './tax-center/components/WorkersCard.jsx'
import { taxCopy } from './tax-center/copy.js'
import { useTaxCenterData } from './tax-center/hooks/useTaxCenterData.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { exportExpensesCsv, exportIncomeCsv, exportTaxSummaryPdf, exportWorkersCsv } from './tax-center/utils/taxExports.js'

export default function TaxCenter() {
  const { user } = useAuth()
  const { lang } = useLang()
  const labels = taxCopy[lang] || taxCopy.en
  const [workerOpen, setWorkerOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)

  const tax = useTaxCenterData(user)

  function exportPdf() {
    exportTaxSummaryPdf({
      year: tax.year,
      lang,
      labels,
      totals: tax.totals,
      workersCount: tax.allWorkers.length,
      incomeCount: tax.yearIncomeRows.length,
      expenseCount: tax.businessExpenses.length,
    })
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <TaxHeader
        labels={labels}
        onExportWorkers={() => exportWorkersCsv(tax.year, tax.allWorkers)}
        onExportIncome={() => exportIncomeCsv(tax.year, tax.incomeRows)}
        onExportExpenses={() => exportExpensesCsv(tax.year, tax.businessExpenses)}
        onExportPdf={exportPdf}
        disableWorkers={tax.allWorkers.length === 0}
        disableIncome={tax.yearIncomeRows.length === 0}
        disableExpenses={tax.businessExpenses.length === 0}
      />

      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{labels.warning}</p>
      {tax.error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{tax.error}<br />{labels.runSql}</p>}

      <TaxStats labels={labels} totals={tax.totals} />

      <section className="mt-5 grid lg:grid-cols-2 gap-5">
        <WorkersCard labels={labels} rows={tax.allWorkers} loading={tax.loading} onAdd={() => setWorkerOpen(true)} onRemove={tax.removeWorker} />
        <IncomeCard labels={labels} rows={tax.yearIncomeRows} loading={tax.loading} onAdd={() => setIncomeOpen(true)} onRemove={tax.removeIncome} />
      </section>

      <ExpensesCard labels={labels} rows={tax.businessExpenses} />

      <WorkerModal open={workerOpen} onClose={() => setWorkerOpen(false)} onSave={async (form) => { await tax.addWorker(form); setWorkerOpen(false) }} labels={labels} />
      <IncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} onSave={async (form) => { await tax.addIncome(form); setIncomeOpen(false) }} labels={labels} />
    </div>
  )
}
