import { Link } from 'react-router-dom'
import {
  ArrowRight, Bell, CalendarDays, CheckCircle2, FileText, Receipt,
  Shield, Sparkles, WalletCards, Building2, HeartHandshake, Smartphone,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    login: 'Đăng nhập',
    start: 'Bắt đầu miễn phí',
    badge: 'Nhắc việc, bill và cuộc sống hằng ngày',
    title: 'Đừng quên bill, lương, nhắc việc và những việc quan trọng nữa.',
    sub: 'TXPick giúp người bận rộn quản lý nhắc việc, hóa đơn, chi tiêu, việc gia đình và việc business trong một app đơn giản.',
    trustLine: 'Dễ dùng trên iPhone và Samsung. Cài như app PWA, nhận thông báo trên điện thoại, không cần thẻ tín dụng để bắt đầu.',
    primaryUse: 'TXPick dùng để làm gì?',
    primaryUseSub: 'Một nơi gọn để nhớ những việc dễ quên khi bạn bận làm cả ngày.',
    useItems: [
      ['Nhắc việc đúng lúc', 'Tạo reminder cho thuốc, lịch hẹn, gia đình, công việc hoặc việc lặp lại.'],
      ['Nhắc bill và ngày tới hạn', 'Giữ các hóa đơn, khoản cần trả và việc tài chính cá nhân trong một chỗ.'],
      ['Theo dõi chi tiêu', 'Ghi nhanh chi tiêu cá nhân và business để cuối tháng dễ xem lại.'],
      ['Hỗ trợ chủ business nhỏ', 'Nhắc payroll, chi phí tiệm, việc giấy tờ và những việc dễ bị quên khi bận.'],
    ],
    busyTitle: 'Bận làm cả ngày? TXPick giúp bạn bớt sợ quên.',
    busySub: 'Dành cho cuộc sống thật: chủ tiệm, người chạy việc, gia đình bận rộn, người có nhiều bill, nhiều lịch và nhiều thứ phải nhớ.',
    busyCards: [
      ['Personal life', 'Lịch bác sĩ, uống thuốc, việc gia đình, bill điện nước, việc cần làm hôm nay.'],
      ['Business life', 'Payroll, supply, chi phí tiệm, việc cuối tuần, giấy tờ cần nhớ trước mùa thuế.'],
      ['Phone reminders', 'Cài app lên Home Screen và nhận thông báo như một app thật.'],
    ],
    howTitle: 'Cách dùng rất đơn giản',
    howSteps: [
      ['1', 'Tạo nhắc việc hoặc bill đầu tiên'],
      ['2', 'Bật thông báo trên điện thoại'],
      ['3', 'Mở trang Hôm nay để biết việc gì cần làm'],
    ],
    featuresTitle: 'Đủ những thứ cần nhớ, không làm bạn rối thêm',
    featuresSub: 'Mở app là biết hôm nay cần làm gì, tiền đi đâu và việc nào sắp tới hạn.',
    f1: ['Hôm nay', 'Một màn hình gọn để xem việc cần làm, hóa đơn sắp tới, chi tiêu trong tháng và gợi ý ngắn cho ngày mới.'],
    f2: ['Nhắc việc', 'Gõ tự nhiên để tạo nhắc việc nhanh cho gia đình, hóa đơn, thuốc, lịch hẹn và việc lặp lại.'],
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
    learnMore: 'Tìm hiểu TXPick',
    finalTitle: 'Bắt đầu từ một reminder đầu tiên.',
    finalSub: 'Tạo tài khoản miễn phí, bật thông báo và để TXPick giúp bạn nhớ những việc quan trọng.',
  },
  en: {
    login: 'Log in',
    start: 'Start free',
    badge: 'Reminders, bills, and daily life',
    title: 'Never forget bills, payroll, reminders, or important tasks again.',
    sub: 'TXPick helps busy people manage reminders, bills, expenses, family tasks, and small business life in one simple app.',
    trustLine: 'Works on iPhone and Samsung as a PWA. Add it to your Home Screen, enable phone notifications, and start free.',
    primaryUse: 'What is TXPick for?',
    primaryUseSub: 'A simple place to remember the things that are easy to miss when life gets busy.',
    useItems: [
      ['Timed reminders', 'Create reminders for medicine, appointments, family, work, and recurring tasks.'],
      ['Bills and due dates', 'Keep bills, payments, and personal money reminders in one clear place.'],
      ['Expense tracking', 'Log personal and business spending quickly so month-end review is easier.'],
      ['Small business help', 'Remember payroll, supplies, salon expenses, paperwork, and weekly business tasks.'],
    ],
    busyTitle: 'Busy all day? TXPick helps you stop worrying about what you forgot.',
    busySub: 'Built for real life: small business owners, gig workers, busy families, and anyone juggling bills, appointments, tasks, and records.',
    busyCards: [
      ['Personal life', 'Doctor appointments, medicine, family tasks, utility bills, and today’s reminders.'],
      ['Business life', 'Payroll, supplies, shop expenses, weekend tasks, and records you may need later.'],
      ['Phone reminders', 'Add TXPick to your Home Screen and receive notifications like a real app.'],
    ],
    howTitle: 'How it works',
    howSteps: [
      ['1', 'Add your first reminder or bill'],
      ['2', 'Enable phone notifications'],
      ['3', 'Open Today to see what matters now'],
    ],
    featuresTitle: 'The important things, without the clutter',
    featuresSub: 'Open the app and know what matters today, where money went, and what is coming due.',
    f1: ['Today', 'A clean daily view for tasks, upcoming bills, monthly spending, and one useful insight.'],
    f2: ['Reminders', 'Create reminders by typing naturally. Good for family, bills, medicine, appointments, and recurring tasks.'],
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
    learnMore: 'Learn what TXPick does',
    finalTitle: 'Start with one reminder.',
    finalSub: 'Create a free account, enable notifications, and let TXPick help you remember the important things.',
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
            <a href="/what-is-txpick.html" className="hidden md:inline-flex btn-ghost text-sm">{c.learnMore}</a>
            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">{c.login}</Link>
            <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">{c.start}</Link>
          </div>
        </div>
      </header>

      <section className="hero-gradient pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <span className="badge bg-brand-50 text-brand-700 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> {c.badge}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-900 leading-[1.05]">
              {c.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-ink-600 max-w-3xl mx-auto">
              {c.sub}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/signup" className="btn-primary">
                {c.start} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="/how-it-works.html" className="btn-secondary">
                {c.learnMore}
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-400 max-w-2xl mx-auto">
              {c.trustLine}
            </p>
          </div>
          <HeroMock c={c} />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-ink-900">{c.primaryUse}</h2>
            <p className="mt-3 text-ink-600">{c.primaryUseSub}</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.useItems.map((item) => <UseItem key={item[0]} title={item[0]} text={item[1]} />)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ink-50 border-y border-ink-100">
        <div className="container-app grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-ink-900">{c.busyTitle}</h2>
            <p className="mt-3 text-ink-600">{c.busySub}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Value icon={HeartHandshake} title={c.busyCards[0][0]} text={c.busyCards[0][1]} />
            <Value icon={Building2} title={c.busyCards[1][0]} text={c.busyCards[1][1]} />
            <Value icon={Smartphone} title={c.busyCards[2][0]} text={c.busyCards[2][1]} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-ink-900">{c.howTitle}</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {c.howSteps.map((step) => <Step key={step[0]} number={step[0]} text={step[1]} />)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
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

function UseItem({ title, text }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-ink-900">{title}</h3>
          <p className="mt-2 text-sm text-ink-500">{text}</p>
        </div>
      </div>
    </div>
  )
}

function Step({ number, text }) {
  return (
    <div className="card p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto">{number}</div>
      <p className="mt-4 font-semibold text-ink-800">{text}</p>
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
      <div className="w-10 h-10 rounded-xl bg-white border border-ink-100 text-brand-700 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-ink-900">{title}</h3>
        <p className="text-sm text-ink-500">{text}</p>
      </div>
    </div>
  )
}
