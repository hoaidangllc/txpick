import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Receipt, WalletCards, Sparkles } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Chào mừng đến với TX Life',
    sub: 'Một nơi gọn gàng để nhớ việc, ghi chi tiêu và xem lại cuối năm. Cùng đi qua nhanh 3 bước nhé.',
    s1Title: 'Thêm một nhắc việc',
    s1Sub: 'Trả tiền điện, đón con, đi gặp bác sĩ — bất cứ việc gì bạn muốn nhớ.',
    s1CTA: 'Mở Nhắc việc',
    s2Title: 'Thêm hóa đơn hằng tháng',
    s2Sub: 'Điện, nước, internet, tiền nhà — nhập một lần, app nhắc đúng ngày mỗi tháng.',
    s2CTA: 'Mở Hóa đơn',
    s3Title: 'Ghi chi tiêu đầu tiên',
    s3Sub: 'Cá nhân hay kinh doanh đều ghi chung một chỗ, phân loại rõ để cuối tháng/cuối năm dễ xem lại.',
    s3CTA: 'Mở Chi tiêu',
    cta: 'Vào trang Hôm nay',
    skip: 'Bỏ qua, vào Hôm nay',
    morning: 'Chào buổi sáng',
    afternoon: 'Chào buổi chiều',
    evening: 'Chào buổi tối',
    night: 'Khuya rồi',
  },
  en: {
    title: 'Welcome to TX Life',
    sub: 'A calm place to remember tasks, track expenses, and review at year-end. Three quick steps and you’re set.',
    s1Title: 'Add a reminder',
    s1Sub: 'Pay the electric bill, pick up the kids, doctor visit — anything you want to remember.',
    s1CTA: 'Open Reminders',
    s2Title: 'Add a monthly bill',
    s2Sub: 'Power, water, internet, rent — enter once, the app reminds you each month.',
    s2CTA: 'Open Bills',
    s3Title: 'Log your first expense',
    s3Sub: 'Personal and business go in the same place, neatly categorized for year-end review.',
    s3CTA: 'Open Expenses',
    cta: 'Go to Today',
    skip: 'Skip — take me to Today',
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Late night',
  },
}

function timeGreeting(c) {
  const h = new Date().getHours()
  if (h < 5) return c.night
  if (h < 12) return c.morning
  if (h < 17) return c.afternoon
  if (h < 22) return c.evening
  return c.night
}

export default function Onboarding() {
  const { lang } = useLang()
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const c = copy[lang]
  const userName = (user?.email?.split('@')[0] || '').replace(/[._-]+/g, ' ').trim()

  const finish = () => {
    updateProfile?.({ type: 'personal', onboardedAt: new Date().toISOString() })
    navigate('/today')
  }

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <header className="container-app flex items-center justify-between h-16">
        <Link to="/"><Logo /></Link>
        <LanguageToggle />
      </header>
      <main className="flex-1 container-app pb-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {timeGreeting(c)}{userName ? `, ${userName}` : ''}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-ink-900">{c.title}</h1>
          <p className="mt-2 text-ink-600">{c.sub}</p>

          <div className="mt-8 space-y-3">
            <StepCard num={1} icon={Bell} title={c.s1Title} sub={c.s1Sub} cta={c.s1CTA} href="/reminders" />
            <StepCard num={2} icon={WalletCards} title={c.s2Title} sub={c.s2Sub} cta={c.s2CTA} href="/bills" />
            <StepCard num={3} icon={Receipt} title={c.s3Title} sub={c.s3Sub} cta={c.s3CTA} href="/expenses" />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={finish} className="btn-primary">
              <Sparkles className="w-4 h-4" /> {c.cta}
            </button>
            <button onClick={finish} className="btn-ghost text-sm">{c.skip}</button>
          </div>
        </div>
      </main>
    </div>
  )
}

function StepCard({ num, icon: Icon, title, sub, cta, href }) {
  return (
    <div className="card p-4 sm:p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-ink-400">{String(num).padStart(2, '0')}</p>
        <h3 className="font-bold text-ink-900">{title}</h3>
        <p className="text-sm text-ink-500 mt-0.5">{sub}</p>
      </div>
      <Link to={href} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 shrink-0">
        {cta} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
