import { Link } from 'react-router-dom'
import {
  ArrowRight, Bell, CalendarDays, FileText, Receipt,
  Shield, Sparkles, WalletCards,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    login: 'Đăng nhập',
    start: 'Bắt đầu miễn phí',
    badge: 'App sắp xếp việc hằng ngày',
    title: 'Nhớ ít hơn. Sống gọn hơn.',
    sub: 'TXPick gom nhắc việc, hóa đơn, chi tiêu và tổng kết vào một nơi dễ dùng mỗi ngày.',
    trustLine: 'Bắt đầu miễn phí. Ghi nhanh. Nhắc đúng lúc. Cuối tháng nhìn lại rõ ràng.',
    featuresTitle: 'Đủ những thứ cần nhớ, không làm bạn rối thêm',
    featuresSub: 'Mở app là biết hôm nay cần làm gì, tiền đi đâu và việc nào sắp tới hạn.',
    f1: ['Hôm nay', 'Một màn hình gọn để xem việc cần làm, hóa đơn sắp tới, chi tiêu trong tháng và gợi ý ngắn cho ngày mới.'],
    f2: ['Nhắc việc', 'Gõ như đang nhắn tin để tạo nhắc việc nhanh cho gia đình, hóa đơn và việc lặp lại.'],
    f3: ['Chi tiêu', 'Ghi nhanh tiền cá nhân và business mà không cần biến app thành phần mềm kế toán nặng nề.'],
    f4: ['Tổng kết', 'Cuối tháng, cuối năm có số liệu gọn để xem lại hoặc gửi cho người làm thuế.'],
    v1: ['Dễ dùng mỗi ngày', 'Ít nút, ít màn hình, tập trung vào những việc bạn thật sự cần mở app để xử lý.'],
    v2: ['Gợi ý vừa đủ', 'App giúp nhắc những việc dễ quên và đưa ra gợi ý ngắn, không làm bạn bị ngợp.'],
    v3: ['Dữ liệu rõ ràng', 'Việc, bill và chi tiêu được gom đúng chỗ để cuối tháng không phải lục lại trí nhớ.'],
    mockToday: 'HÔM NAY',
    mockReminders: '3 việc cần nhớ',
    mockBill: 'Trả tiền điện — 9 giờ tối',
    mockMonth: 'CHI TIÊU THÁNG NÀY',
    mockExpense: 'Cá nhân + business',
    mockInsight: 'GỢI Ý HÔM NAY',
    mockTip: 'Có 2 hóa đơn sắp tới hạn. Ghi chi tiêu hôm nay để cuối tháng nhẹ đầu hơn.',
    finalTitle: 'Bắt đầu từ hôm nay.',
    finalSub: 'Tạo tài khoản miễn phí và giữ mọi thứ quan trọng trong một nơi gọn gàng.',
  },
  en: {
    login: 'Log in',
    start: 'Start free',
    badge: 'A daily organizer app',
    title: 'Remember less. Live lighter.',
    sub: 'TXPick brings reminders, bills, expenses, and summaries into one simple place you can use every day.',
    trustLine: 'Start free. Add quickly. Get reminded on time. Review the month with clarity.',
    featuresTitle: 'The important things, without the clutter',
    featuresSub: 'Open the app and know what matters today, where money went, and what is coming due.',
    f1: ['Today', 'A clean daily view for tasks, upcoming bills, monthly spending, and one useful insight.'],
    f2: ['Reminders', 'Create reminders by typing normally. Good for personal, family, bill, and recurring tasks.'],
    f3: ['Expenses', 'Track personal and business spending without turning the app into heavy accounting software.'],
    f4: ['Summary', 'Monthly and yearly numbers organized clearly so review time is easier.'],
    v1: ['Made for daily use', 'Fewer screens, fewer distractions, and a clear focus on what you actually need to handle.'],
    v2: ['Light guidance', 'Helpful nudges for easy-to-forget tasks, without overwhelming you.'],
    v3: ['Clear records', 'Tasks, bills, and spending stay organized so month-end does not depend on memory.'],
    mockToday: 'TODAY',
    mockReminders: '3 things to remember',
    mockBill: 'Pay electric bill — 9 PM',
    mockMonth: 'THIS MONTH',
    mockExpense: 'Personal + business',
    mockInsight: 'TODAY’S NUDGE',
    mockTip: 'You have 2 bills coming up. Log today’s spending so month-end feels lighter.',
    finalTitle: 'Start today.',
    finalSub: 'Create a free account and keep the important things in one calm place.',
  },
}

export default function Landing() {
  const { lang } = useLang()
  const c = copy[lang]
  return (
    <div className="min-h-screen bg-white">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">{c.login}</Link>
            <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">{c.start}</Link>
          </div>
        </div>
      </header>

      <section className="hero-gradient pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <span className="badge bg-brand-50 text-brand-700 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> {c.badge}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-900 leading-[1.05]">
              {c.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto">
              {c.sub}
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/signup" className="btn-primary">
                {c.start} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-400 max-w-xl mx-auto">
              {c.trustLine}
            </p>
          </div>
          <HeroMock c={c} />
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-ink-900">{c.featuresTitle}</h2>
            <p className="mt-3 text-ink-600">{c.featuresSub}</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Feature icon={CalendarDays} title={c.f1[0]} text={c.f1[1]} />
            <Feature icon={Bell} title={c.f2[0]} text={c.f2[1]} />
            <Feature icon={Receipt} title={c.f3[0]} text={c.f3[1]} />
            <Feature icon={FileText} title={c.f4[0]} text={c.f4[1]} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-ink-50 border-y border-ink-100">
        <div className="container-app grid sm:grid-cols-3 gap-6">
          <Value icon={WalletCards} title={c.v1[0]} text={c.v1[1]} />
          <Value icon={Sparkles} title={c.v2[0]} text={c.v2[1]} />
          <Value icon={Shield} title={c.v3[0]} text={c.v3[1]} />
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="card max-w-3xl mx-auto p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900">{c.finalTitle}</h2>
            <p className="mt-2 text-ink-600">{c.finalSub}</p>
            <div className="mt-6 flex justify-center">
              <Link to="/signup" className="btn-primary">
                {c.start} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function HeroMock({ c }) {
  return (
    <div className="mt-14 max-w-4xl mx-auto card p-4 sm:p-6 text-left">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-bold text-brand-700">{c.mockToday}</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900">{c.mockReminders}</p>
          <p className="text-sm text-ink-500">{c.mockBill}</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-100 p-4">
          <p className="text-xs font-bold text-ink-500">{c.mockMonth}</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900">$1,240</p>
          <p className="text-sm text-ink-500">{c.mockExpense}</p>
        </div>
        <div className="rounded-2xl bg-gold-500/10 p-4">
          <p className="text-xs font-bold text-gold-700">{c.mockInsight}</p>
          <p className="mt-2 text-sm text-ink-700">{c.mockTip}</p>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="card p-5">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{text}</p>
    </div>
  )
}

function Value({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white border border-ink-100 text-brand-700 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-ink-900">{title}</h3>
        <p className="text-sm text-ink-500">{text}</p>
      </div>
    </div>
  )
}
