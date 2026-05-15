import { fmtUSD, todayISO } from '../../lib/lifeStore.js'
import { downloadCSV, downloadSimplePDF } from '../../lib/exporters.js'
import { addressFrom, money, workerTotal } from './taxUtils.js'

export function exportWorkersCsv({ year, workers }) {
  downloadCSV(`tax-workers-${year}.csv`, [
    ['Type', 'Name', 'SSN/EIN', 'Address', 'Work Pay', 'Tips', 'Total', 'Tax Year', 'Notes'],
    ...workers.map((x) => [x.type, x.name, x.tax_id, addressFrom(x), money(x.work_pay ?? x.wages ?? x.payments), money(x.tips), workerTotal(x), x.tax_year, x.notes]),
  ])
}

export function exportIncomeCsv({ year, incomeRows }) {
  downloadCSV(`business-income-${year}.csv`, [
    ['Date', 'Source', 'Category', 'Amount', 'Notes'],
    ...incomeRows.map((x) => [x.record_date, x.source, x.category, x.amount, x.notes]),
  ])
}

export function exportExpensesCsv({ year, expenses }) {
  downloadCSV(`business-expenses-${year}.csv`, [
    ['Date', 'Title', 'Category', 'Amount', 'Notes'],
    ...expenses.map((x) => [x.expense_date || x.date, x.title, x.category, x.amount, x.notes || x.note]),
  ])
}

export function exportTaxSummaryPdf({ year, lang, c, totals, workers, incomeRows, expenses }) {
  downloadSimplePDF(`business-tax-summary-${year}.pdf`, lang === 'vi' ? `Tổng kết thuế business ${year}` : `Business Tax Summary ${year}`, [
    `${c.businessIncome}: ${fmtUSD(totals.income)}`,
    `${c.workerTotal}: ${fmtUSD(totals.workerPay)}`,
    `${c.businessExpenseTotal}: ${fmtUSD(totals.expense)}`,
    `${c.netBusiness}: ${fmtUSD(totals.net)}`,
    `${c.workers}: ${workers.length}`,
    `${c.income}: ${incomeRows.length}`,
    `${c.expenses}: ${expenses.length}`,
    `Generated: ${todayISO()}`,
  ])
}
