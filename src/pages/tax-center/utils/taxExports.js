import { fmtUSD, todayISO } from '../../../lib/lifeStore.js'
import { downloadCSV, downloadSimplePDF } from '../../../lib/exporters.js'
import { addressFrom, money, workerTotal, inTaxYear } from './taxMath.js'

export function exportWorkersCsv(year, workers) {
  downloadCSV(`tax-workers-${year}.csv`, [
    ['Type', 'Name', 'SSN/EIN', 'Address', 'Work Pay', 'Tips', 'Total', 'Tax Year', 'Notes'],
    ...workers.map((x) => [x.type, x.name, x.tax_id, addressFrom(x), money(x.work_pay ?? x.wages ?? x.payments), money(x.tips), workerTotal(x), x.tax_year, x.notes]),
  ])
}

export function exportIncomeCsv(year, rows) {
  downloadCSV(`business-income-${year}.csv`, [
    ['Date', 'Source', 'Category', 'Amount', 'Notes'],
    ...rows.filter((x) => inTaxYear(x.record_date, year)).map((x) => [x.record_date, x.source, x.category, x.amount, x.notes]),
  ])
}

export function exportExpensesCsv(year, rows) {
  downloadCSV(`business-expenses-${year}.csv`, [
    ['Date', 'Title', 'Category', 'Amount', 'Notes'],
    ...rows.map((x) => [x.expense_date || x.date, x.title, x.category, x.amount, x.notes || x.note]),
  ])
}

export function exportTaxSummaryPdf({ year, lang, labels, totals, workersCount, incomeCount, expenseCount }) {
  downloadSimplePDF(`business-tax-summary-${year}.pdf`, lang === 'vi' ? `Tổng kết thuế business ${year}` : `Business Tax Summary ${year}`, [
    `${labels.businessIncome}: ${fmtUSD(totals.income)}`,
    `${labels.workerTotal}: ${fmtUSD(totals.workerPay)}`,
    `${labels.businessExpenseTotal}: ${fmtUSD(totals.expense)}`,
    `${labels.netBusiness}: ${fmtUSD(totals.net)}`,
    `${labels.workers}: ${workersCount}`,
    `${labels.income}: ${incomeCount}`,
    `${labels.expenses}: ${expenseCount}`,
    `Generated: ${todayISO()}`,
  ])
}
