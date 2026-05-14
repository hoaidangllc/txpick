import { useMemo } from 'react'
import { Download, FileText, Wallet } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { fmtUSD } from '../lib/lifeStore.js'
import { billsDb, expensesDb, useRemoteCollection } from '../lib/db.js'
import { downloadCSV, downloadSimplePDF } from '../lib/exporters.js'
import { buildMonthlySummary, groupExpensesByMonth } from '../lib/assistantIntelligence.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Tổng kết',
    sub: 'Không tư vấn thuế. Trang này chỉ gom số liệu cuối tháng và cuối năm để bạn đưa cho người làm thuế.',
    export: 'Xuất CSV', exportPdf: 'Xuất PDF',
    yearExpenses: 'Chi tiêu trong năm', monthlyBills: 'Hóa đơn hằng tháng', records: 'Số dòng dữ liệu',
    month: 'Tháng', business: 'Kinh doanh', personal: 'Cá nhân', total: 'Tổng',
    empty: 'Chưa có dữ liệu để tổng kết. Hãy ghi chi tiêu đầu tiên.',
    aiSummary: 'Tóm tắt thông minh',
    pro: 'Pro Plus $4.99/tháng mở tổng kết và xuất file cuối năm, gợi ý thông minh, nhắc cho người trong gia đình và thông báo nâng cao. Gói miễn phí vẫn dùng được trang Hôm nay, nhắc việc và chi tiêu cơ bản.',
    none: '—',
  },
  en: {
    title: 'Summary',
    sub: 'No tax advice. This page only organizes monthly and yearly numbers so you can hand them to your tax preparer.',
    export: 'Export CSV', exportPdf: 'Export PDF',
    yearExpenses: 'Year expenses', monthlyBills: 'Monthly bills', records: 'Records',
    month: 'Month', business: 'Business', personal: 'Personal', total: 'Total',
    empty: 'Nothing to summarize yet. Add your first expense to get started.',
    aiSummary: 'Smart summary',
    pro: 'Pro Plus $4.99/mo unlocks year-end summary & export, smart insights, family reminders, and advanced notifications. Free still includes Today, reminders, and basic expenses.',
    none: '—',
  },
}

export default function Summary() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [expenses, , expensesState] = useRemoteCollection(user?.id, expensesDb)
  const [bills, , billsState] = useRemoteCollection(user?.id, billsDb)

  const rows = useMemo(() => groupExpensesByMonth(expenses), [expenses])
  const smartSummary = useMemo(
    () => buildMonthlySummary({ expenses, bills, lang }),
    [expenses, bills, lang],
  )

  const yearly = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const monthlyBillTotal = bills.reduce((s, b) => s + Number(b.amount || 0), 0)

  const exportCSV = () => {
    downloadCSV('txpick-expenses.csv', [
      ['date', 'title', 'category', 'expense_type', 'tax_category', 'amount', 'note'],
      ...expenses.map((e) => [e.date, e.title, e.category, e.expense_type || '', e.tax_category || '', e.amount || 0, e.note || '']),
    ])
  }


  const exportPDF = () => {
    downloadSimplePDF('txpick-summary.pdf', 'TxPick Summary', [
      `Year expenses: ${fmtUSD(yearly)}`,
      `Monthly bills: ${fmtUSD(monthlyBillTotal)}`,
      `Records: ${expenses.length}`,
      '',
      smartSummary,
      '',
      ...rows.map(([m, v]) => `${m}: total ${fmtUSD(v.total)} | business ${fmtUSD(v.business)} | personal ${fmtUSD(v.personal)}`),
    ])
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
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-primary" disabled={expenses.length === 0}>
            <Download className="w-4 h-4" /> {c.export}
          </button>
          <button onClick={exportPDF} className="btn-secondary" disabled={expenses.length === 0}>
            <Download className="w-4 h-4" /> {c.exportPdf}
          </button>
        </div>
      </div>
      {(expensesState.error || billsState.error) && <p className="mt-4 text-sm text-rose-600">{expensesState.error || billsState.error}</p>}
      <section className="mt-5 card p-4 sm:p-5">
        <h2 className="font-bold text-ink-900">{c.aiSummary}</h2>
        <p className="mt-1 text-sm text-ink-600 leading-relaxed">{smartSummary}</p>
      </section>

      <section className="mt-5 grid sm:grid-cols-3 gap-3">
        <StatCard label={c.yearExpenses} value={yearly ? fmtUSD(yearly) : c.none} icon={Wallet} tone="brand" />
        <StatCard label={c.monthlyBills} value={monthlyBillTotal ? fmtUSD(monthlyBillTotal) : c.none} />
        <StatCard label={c.records} value={expenses.length || c.none} />
      </section>
      <div className="mt-5 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left">{c.month}</th>
              <th className="px-4 py-3 text-right">{c.business}</th>
              <th className="px-4 py-3 text-right">{c.personal}</th>
              <th className="px-4 py-3 text-right">{c.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.length === 0 ? (
              <tr><td colSpan="4" className="py-10 text-center text-ink-400">{c.empty}</td></tr>
            ) : (
              rows.map(([m, v]) => (
                <tr key={m}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{m}</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(v.business)}</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(v.personal)}</td>
                  <td className="px-4 py-3 text-right font-bold">{fmtUSD(v.total)}</td>
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
