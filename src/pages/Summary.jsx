import { Download, FileText, Wallet } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS, fmtUSD, monthKey } from '../lib/lifeStore.js'

export default function Summary() {
  const [expenses] = useLocalStore(STORAGE_KEYS.expenses, [])
  const [bills] = useLocalStore(STORAGE_KEYS.bills, [])
  const byMonth = expenses.reduce((acc, e) => { const k = monthKey(e.date); acc[k] = acc[k] || { total: 0, business: 0, personal: 0 }; acc[k].total += Number(e.amount || 0); if (['business', 'salon', 'supply'].includes(e.category)) acc[k].business += Number(e.amount || 0); else acc[k].personal += Number(e.amount || 0); return acc }, {})
  const rows = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))
  const yearly = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const exportCSV = () => {
    const head = 'date,title,category,amount,note\n'
    const body = expenses.map((e) => [e.date, e.title, e.category, e.amount, e.note || ''].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([head + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'txpick-expenses-export.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <div className="container-app py-6 sm:py-8"><div className="flex items-end justify-between gap-3"><div><h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><FileText className="w-7 h-7 text-brand-600" /> Summary</h1><p className="text-ink-500 mt-1">Không tư vấn thuế. Chỉ gom số liệu cuối tháng/cuối năm để đưa cho người làm thuế.</p></div><button onClick={exportCSV} className="btn-primary"><Download className="w-4 h-4" /> Export CSV</button></div><section className="mt-5 grid sm:grid-cols-3 gap-3"><StatCard label="Year expenses" value={fmtUSD(yearly)} icon={Wallet} tone="brand" /><StatCard label="Monthly bills" value={fmtUSD(bills.reduce((s, b) => s + Number(b.amount || 0), 0))} /><StatCard label="Records" value={expenses.length} /></section><div className="mt-5 card overflow-hidden"><table className="w-full text-sm"><thead className="bg-ink-50 text-ink-500"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-right">Business</th><th className="px-4 py-3 text-right">Personal</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-ink-100">{rows.length === 0 ? <tr><td colSpan="4" className="py-10 text-center text-ink-400">Chưa có dữ liệu.</td></tr> : rows.map(([m, v]) => <tr key={m}><td className="px-4 py-3 font-semibold text-ink-900">{m}</td><td className="px-4 py-3 text-right">{fmtUSD(v.business)}</td><td className="px-4 py-3 text-right">{fmtUSD(v.personal)}</td><td className="px-4 py-3 text-right font-bold">{fmtUSD(v.total)}</td></tr>)}</tbody></table></div><div className="mt-4 rounded-2xl bg-gold-500/10 text-gold-700 p-4 text-sm">Pro $4.99 sẽ mở yearly summary/export, smart insights, family reminders và advanced notifications. Free vẫn dùng được Today + reminder + expense cơ bản.</div></div>
}
