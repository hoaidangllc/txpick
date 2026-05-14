import { useMemo } from 'react'
import { Download, FileText, Wallet } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, fmtUSD, monthKey } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Tổng kết',
    sub: 'Không tư vấn thuế. Trang này chỉ gom số liệu cuối tháng và cuối năm để bạn đưa cho người làm thuế.',
    export: 'Xuất CSV',
    yearExpenses: 'Chi tiêu trong năm', monthlyBills: 'Hóa đơn hằng tháng', records: 'Số dòng dữ liệu',
    month: 'Tháng', business: 'Kinh doanh', personal: 'Cá nhân', total: 'Tổng',
    empty: 'Chưa có dữ liệu để tổng kết. Hãy ghi chi tiêu đầu tiên.',
    pro: 'Pro Plus $4.99/tháng mở tổng kết và xuất file cuối năm, gợi ý thông minh, nhắc cho người trong gia đình và thông báo nâng cao. Gói miễn phí vẫn dùng được trang Hôm nay, nhắc việc và chi tiêu cơ bản.',
    none: '—',
  },
  en: {
    title: 'Summary',
    sub: 'No tax advice. This page only organizes monthly and yearly numbers so you can hand them to your tax preparer.',
    export: 'Export CSV',
    yearExpenses: 'Year expenses', monthlyBills: 'Monthly bills', records: 'Records',
    month: 'Month', business: 'Business', personal: 'Personal', total: 'Total',
    empty: 'Nothing to summarize yet. Add your first expense to get started.',
    pro: 'Pro Plus $4.99/mo unlocks year-end summary & export, smart insights, family reminders, and advanced notifications. Free still includes Today, reminders, and basic expenses.',
    none: '—',
  },
}

export default function Summary() {
  const { lang } = useLang()
  const c = copy[lang]
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])

  const rows = useMemo(() => {
    const map = {}
    for (const e of expenses) {
      const m = monthKey(e.date)
      if (!map[m]) map[m] = { business: 0, personal: 0, total: 0 }
      const amount = Number(e.amount || 0)
      if (['business', 'salon', 'supply'].includes(e.category)) map[m].business += amount
      else map[m].personal += amount
      map[m].total += amount
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [expenses])

  const yearly = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const monthlyBillTotal = bills.reduce((s, b) => s + Number(b.amount || 0), 0)

  const exportCSV = () => {
    const csv = ['date,title,category,amount,note', ...expenses.map((e) => `${e.date},"${e.title}",${e.category},${e.amount || 0},"${e.note || ''}"`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'txpick-expenses.csv'
    a.click()
    URL.revokeObjectURL(url)
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
        <button onClick={exportCSV} className="btn-primary" disabled={expenses.length === 0}>
          <Download className="w-4 h-4" /> {c.export}
        </button>
      </div>
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
