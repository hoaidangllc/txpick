import { Link } from 'react-router-dom'
import { Bell, BriefcaseBusiness, FileText, Plus, Receipt, UsersRound } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { fmtUSD } from '../lib/lifeStore.js'
import { taxCopy } from './tax-center/copy.js'
import { useTaxCenterData } from './tax-center/hooks/useTaxCenterData.js'

const copy = {
  vi: {
    title: 'Khu kinh doanh',
    sub: 'Khu riêng cho chủ tiệm/business: 1099/W-2, doanh thu, chi tiêu mỗi ngày/mỗi tháng và hồ sơ cuối năm cho người làm thuế.',
    openTax: 'Mở hồ sơ thuế',
    addIncome: 'Thêm doanh thu',
    addExpense: 'Thêm chi tiêu',
    reminders: 'Nhắc việc kinh doanh',
    workers: '1099/W-2',
    income: 'Doanh thu năm nay',
    expenses: 'Chi tiêu năm nay',
    net: 'Ước tính còn lại',
    quickTitle: 'Việc nên làm trong khu kinh doanh',
    q1: 'Nhập thợ 1099 hoặc nhân viên W-2 với tên, SSN/EIN, địa chỉ và tổng tiền.',
    q2: 'Ghi income và chi tiêu business mỗi ngày/mỗi tháng theo nhóm rõ ràng.',
    q3: 'Tạo reminder cho payroll, bill business, tax deadline, license renewal.',
  },
  en: {
    title: 'Business Workspace',
    sub: 'A separate owner area for 1099/W-2, business income, daily/monthly business expenses, and year-end tax-preparer files.',
    openTax: 'Open Tax Center',
    addIncome: 'Add income',
    addExpense: 'Add expense',
    reminders: 'Business reminders',
    workers: '1099/W-2',
    income: 'Income this year',
    expenses: 'Expenses this year',
    net: 'Estimated net',
    quickTitle: 'What to do in Business workspace',
    q1: 'Enter 1099 contractors or W-2 employees with name, SSN/EIN, address, and total pay.',
    q2: 'Log business income and expenses daily/monthly with clean categories.',
    q3: 'Create reminders for payroll, business bills, tax deadlines, and license renewals.',
  },
}

export default function BusinessHome() {
  const { user, profile } = useAuth()
  const { lang } = useLang()
  const c = copy[lang] || copy.en
  const labels = taxCopy[lang] || taxCopy.en
  const tax = useTaxCenterData(user)

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{profile?.business_name || profile?.businessName || (lang === 'vi' ? 'Chủ tiệm / Business' : 'Owner mode')}</p>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <BriefcaseBusiness className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-3xl">{c.sub}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link to="/tax" className="btn-primary"><FileText className="w-4 h-4" /> {c.openTax}</Link>
          <Link to="/reminders" className="btn-secondary"><Bell className="w-4 h-4" /> {c.reminders}</Link>
        </div>
      </div>

      <section className="mt-5 grid sm:grid-cols-4 gap-3">
        <StatCard label={c.workers} value={`${tax.counts.contractors1099} / ${tax.counts.w2}`} icon={UsersRound} />
        <StatCard label={c.income} value={fmtUSD(tax.totals.income)} icon={Plus} tone="brand" />
        <StatCard label={c.expenses} value={fmtUSD(tax.totals.expense)} icon={Receipt} />
        <StatCard label={c.net} value={fmtUSD(tax.totals.net)} icon={FileText} />
      </section>

      <section className="mt-5 grid lg:grid-cols-3 gap-4">
        {labels.prepCards.slice(0, 3).map((card) => (
          <div key={card.title} className="card p-5">
            <h2 className="font-extrabold text-ink-900">{card.title}</h2>
            <p className="mt-1 text-sm text-ink-500 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 card p-5">
        <h2 className="font-extrabold text-ink-900">{c.quickTitle}</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-ink-600">
          {[c.q1, c.q2, c.q3].map((item) => <p key={item} className="rounded-2xl bg-ink-50 border border-ink-100 p-4">{item}</p>)}
        </div>
      </section>
    </div>
  )
}
