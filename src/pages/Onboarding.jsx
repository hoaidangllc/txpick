import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, Bell, BriefcaseBusiness, Receipt, UserRound, WalletCards } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Bạn muốn dùng app cho mục nào?',
    sub: 'Chọn một kiểu chính trước. Sau này vẫn đổi được trong Cài đặt. Nhắc việc dùng chung cho cả Cá nhân và Kinh doanh.',
    personalTitle: 'Cá nhân',
    personalSub: 'Hóa đơn gia đình, chi tiêu cá nhân, việc cần nhớ, tổng kết tháng.',
    setup: 'Thiết lập ban đầu',
    businessTitle: 'Kinh doanh / Chủ tiệm',
    businessSub: '1099, W-2, doanh thu business, chi tiêu tiệm mỗi ngày/mỗi tháng, xuất file cho người làm thuế.',
    choosePersonal: 'Dùng cho cá nhân',
    chooseBusiness: 'Dùng cho kinh doanh',
    businessName: 'Tên business / tiệm',
    businessPlaceholder: 'Ví dụ: Annie\'s Nails & Spa',
    reminders: 'Nhắc việc tích hợp cho cả 2',
    tax: '1099/W-2 + hồ sơ thuế',
    expense: 'Chi tiêu hằng ngày / hằng tháng',
    bills: 'Hóa đơn cá nhân',
    summary: 'Tổng kết cá nhân',
    go: 'Tiếp tục',
  },
  en: {
    setup: 'Quick setup',
    title: 'What do you want to use the app for?',
    sub: 'Pick your main workspace first. You can change it later in Settings. Reminders work for both Personal and Business.',
    personalTitle: 'Personal',
    personalSub: 'Home bills, personal expenses, reminders, and monthly summaries.',
    businessTitle: 'Business / Owner',
    businessSub: '1099, W-2, business income, daily/monthly business expenses, and tax-preparer exports.',
    choosePersonal: 'Use Personal',
    chooseBusiness: 'Use Business',
    businessName: 'Business / salon name',
    businessPlaceholder: 'Example: Annie\'s Nails & Spa',
    reminders: 'Reminders for both',
    tax: '1099/W-2 + Tax Center',
    expense: 'Daily/monthly expenses',
    bills: 'Personal bills',
    summary: 'Personal summary',
    go: 'Continue',
  },
}

export default function Onboarding() {
  const { lang } = useLang()
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const c = copy[lang]
  const [businessName, setBusinessName] = useState('')

  const selectType = async (type) => {
    await updateProfile?.({
      type,
      business_name: type === 'business' ? businessName.trim() || null : undefined,
      onboardedAt: new Date().toISOString(),
    })
    navigate(type === 'business' ? '/business' : '/today', { replace: true })
  }

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <header className="container-app flex items-center justify-between h-16">
        <Link to="/"><Logo /></Link>
        <LanguageToggle />
      </header>
      <main className="flex-1 container-app pb-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{c.setup}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-ink-900">{c.title}</h1>
          <p className="mt-2 text-ink-600 max-w-2xl">{c.sub}</p>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <ChoiceCard
              icon={UserRound}
              title={c.personalTitle}
              sub={c.personalSub}
              bullets={[c.bills, c.reminders, c.summary]}
              button={c.choosePersonal}
              onClick={() => selectType('personal')}
            />
            <ChoiceCard
              icon={BriefcaseBusiness}
              title={c.businessTitle}
              sub={c.businessSub}
              bullets={[c.tax, c.expense, c.reminders]}
              button={c.chooseBusiness}
              onClick={() => selectType('business')}
              strong
            >
              <label className="block mt-5">
                <span className="label">{c.businessName}</span>
                <input
                  className="input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={c.businessPlaceholder}
                />
              </label>
            </ChoiceCard>
          </div>
        </div>
      </main>
    </div>
  )
}

function ChoiceCard({ icon: Icon, title, sub, bullets, button, onClick, strong = false, children }) {
  return (
    <div className={`card p-5 sm:p-6 border-2 ${strong ? 'border-brand-200 bg-brand-50/40' : 'border-transparent'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${strong ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-ink-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-600 leading-relaxed">{sub}</p>
        </div>
      </div>
      {children}
      <div className="mt-5 grid gap-2">
        {bullets.map((item, idx) => (
          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            {idx === 0 ? <Receipt className="w-4 h-4 text-brand-600" /> : idx === 1 ? <WalletCards className="w-4 h-4 text-brand-600" /> : <Bell className="w-4 h-4 text-brand-600" />}
            {item}
          </div>
        ))}
      </div>
      <button onClick={onClick} className={strong ? 'btn-primary mt-6 w-full' : 'btn-secondary mt-6 w-full'}>
        {button} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
