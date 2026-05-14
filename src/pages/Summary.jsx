import { useMemo } from 'react'
import { Download, FileText, Receipt, Wallet } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { fmtUSD } from '../lib/lifeStore.js'
import { billsDb, expensesDb, remindersDb, useRemoteCollection } from '../lib/db.js'
import { downloadCSV, downloadSimplePDF } from '../lib/exporters.js'
import { buildMonthlySummary, buildYearEndLines, groupExpensesByMonth } from '../lib/assistantIntelligence.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Tổng kết',
    sub: 'Không tư vấn thuế. Trang này chỉ gom số liệu cuối tháng và cuối năm để bạn đưa cho người làm thuế.',
    exportExpenses: 'CSV chi tiêu', exportBills: 'CSV hóa đơn', exportPdf: 'PDF cuối năm',
    yearExpenses: 'Chi tiêu trong năm', monthlyBills: 'Hóa đơn hằng tháng', records: 'Số dòng dữ liệu', completed: 'Việc đã xong',
    month: 'Tháng', business: 'Kinh doanh', personal: 'Cá nhân', total: 'Tổng', count: 'Số dòng',
    empty: 'Chưa có dữ liệu để tổng kết. Hãy ghi chi tiêu đầu tiên.',
    aiSummary: 'Tóm tắt thông minh', exportTitle: 'Xuất file', exportSub: 'CSV để mở bằng Excel/Google Sheets. PDF để lưu cuối tháng hoặc cuối năm.',
    pro: 'Gợi ý: dùng app mỗi ngày để cuối tháng/cuối năm khỏi phải ngồi lục lại bill và chi tiêu. Đây không phải phần mềm kế toán hay tư vấn thuế.',
    none: '—', loading: 'Đang tải dữ liệu…',
  },
  en: {
    title: 'Summary',
    sub: 'No tax advice. This page only organizes monthly and yearly numbers so you can hand them to your tax preparer.',
    exportExpenses: 'Expenses CSV', exportBills: 'Bills CSV', exportPdf: 'Year PDF',
    yearExpenses: 'Year expenses', monthlyBills: 'Monthly bills', records: 'Records', completed: 'Completed',
    month: 'Month', business: 'Business', personal: 'Personal', total: 'Total', count: 'Records',
    empty: 'Nothing to summarize yet. Add your first expense to get started.',
    aiSummary: 'Smart summary', exportTitle: 'Export files', exportSub: 'CSV for Excel/Google Sheets. PDF for month-end or year-end review.',
    pro: 'Tip: use the app daily so month-end and year-end numbers are easier to review. This is not accounting software or tax advice.',
    none: '—', loading: 'Loading data…',
  },
}

function fileDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function Summary() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [expenses, , expensesState] = useRemoteCollection(user?.id, expensesDb)
  const [bills, , billsState] = useRemoteCollection(user?.id, billsDb)
  const [reminders, , remindersState] = useRemoteCollection(user?.id, remindersDb)

  const rows = useMemo(() => groupExpensesByMonth(expenses), [expenses])
  const smartSummary = useMemo(
    () => buildMonthlySummary({ expenses, bills, lang }),
    [expenses, bills, lang],
  )
  const pdfLines = useMemo(
    () => buildYearEndLines({ expenses, bills, reminders, lang }),
    [expenses, bills, reminders, lang],
  )

  const yearly = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const monthlyBillTotal = bills.reduce((s, b) => s + Number(b.amount || 0), 0)
  const completed = reminders.filter((r) => r.done || r.completed).length
  const loading = expensesState.loading || billsState.loading || remindersState.loading
  const error = expensesState.error || billsState.error || remindersState.error

  const exportExpensesCSV = () => {
    downloadCSV(`sh-life-expenses-${fileDate()}.csv`, [
      ['date', 'title', 'category', 'expense_type', 'tax_category', 'amount', 'note'],
      ...expenses.map((e) => [e.date, e.title, e.category, e.expense_type || '', e.tax_category || '', e.amount || 0, e.note || '']),
    ])
  }

  const exportBillsCSV = () => {
    downloadCSV(`sh-life-bills-${fileDate()}.csv`, [
      ['due_date', 'title', 'category', 'amount', 'paid', 'paid_at'],
      ...bills.map((b) => [b.dueDate || b.due_date || '', b.name || b.title, b.category || '', b.amount || 0, b.paid ? 'yes' : 'no', b.paid_at || '']),
    ])
  }

  const exportPDF = () => {
    downloadSimplePDF(`sh-life-summary-${fileDate()}.pdf`, lang === 'vi' ? 'SH Life AI - Tổng kết' : 'SH Life AI - Summary', pdfLines)
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportExpensesCSV} className="btn-primary" disabled={expenses.length === 0}>
            <Download className="w-4 h-4" /> {c.exportExpenses}
          </button>
          <button onClick={exportBillsCSV} className="btn-secondary" disabled={bills.length === 0}>
            <Download className="w-4 h-4" /> {c.exportBills}
          </button>
          <button onClick={exportPDF} className="btn-secondary" disabled={expenses.length === 0 && bills.length === 0 && reminders.length === 0}>
            <Download className="w-4 h-4" /> {c.exportPdf}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {loading && <p className="mt-4 text-sm text-ink-400">{c.loading}</p>}

      <section className="mt-5 card p-4 sm:p-5">
        <h2 className="font-bold text-ink-900">{c.aiSummary}</h2>
        <p className="mt-1 text-sm text-ink-600 leading-relaxed">{smartSummary}</p>
      </section>

      <section className="mt-5 grid sm:grid-cols-4 gap-3">
        <StatCard label={c.yearExpenses} value={yearly ? fmtUSD(yearly) : c.none} icon={Wallet} tone="brand" />
        <StatCard label={c.monthlyBills} value={monthlyBillTotal ? fmtUSD(monthlyBillTotal) : c.none} icon={Receipt} />
        <StatCard label={c.records} value={expenses.length || c.none} />
        <StatCard label={c.completed} value={completed || c.none} />
      </section>

      <section className="mt-5 card p-4 sm:p-5">
        <h2 className="font-bold text-ink-900">{c.exportTitle}</h2>
        <p className="mt-1 text-sm text-ink-500">{c.exportSub}</p>
      </section>

      <div className="mt-5 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left">{c.month}</th>
              <th className="px-4 py-3 text-right">{c.business}</th>
              <th className="px-4 py-3 text-right">{c.personal}</th>
              <th className="px-4 py-3 text-right">{c.total}</th>
              <th className="px-4 py-3 text-right">{c.count}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-ink-400">{c.empty}</td></tr>
            ) : (
              rows.map(([m, v]) => (
                <tr key={m}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{m}</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(v.business)}</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(v.personal)}</td>
                  <td className="px-4 py-3 text-right font-bold">{fmtUSD(v.total)}</td>
                  <td className="px-4 py-3 text-right">{v.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-2xl bg-gold-500/10 text-gold-700 p-4 text-sm">{c.pro}</div>
    </div>
  )
}
