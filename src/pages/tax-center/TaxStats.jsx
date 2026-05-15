import { BriefcaseBusiness, FileText, UserRound, WalletCards } from 'lucide-react'
import StatCard from '../../components/StatCard.jsx'
import { fmtUSD } from '../../lib/lifeStore.js'

export default function TaxStats({ c, totals }) {
  return (
    <section className="mt-5 grid sm:grid-cols-4 gap-3">
      <StatCard label={c.businessIncome} value={fmtUSD(totals.income)} icon={WalletCards} tone="brand" />
      <StatCard label={c.workerTotal} value={fmtUSD(totals.workerPay)} icon={UserRound} />
      <StatCard label={c.businessExpenseTotal} value={fmtUSD(totals.expense)} icon={BriefcaseBusiness} />
      <StatCard label={c.netBusiness} value={fmtUSD(totals.net)} icon={FileText} />
    </section>
  )
}
