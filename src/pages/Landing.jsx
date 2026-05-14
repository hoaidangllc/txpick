import { Link } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, FileText, Receipt, Shield, Sparkles, WalletCards } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    pricing: 'Bảng giá', login: 'Đăng nhập', start: 'Bắt đầu miễn phí', plans: 'Xem bảng giá',
    badge: 'App quản lý đời sống hằng ngày cho người Việt ở Mỹ',
    title: 'Mở mỗi ngày. Nhớ ít hơn. Quản lý gọn hơn.',
    sub: 'Nhắc việc, hóa đơn hằng tháng, chi tiêu cá nhân, chi tiêu kinh doanh và tổng kết cuối năm — đơn giản để dùng mỗi ngày.',
    note: 'Không chat AI vô hạn. Không scan hóa đơn. Không tư vấn thuế. Chỉ tập trung vào việc ghi nhớ, theo dõi và tổng kết.',
    featuresTitle: 'Mọi thứ cần thiết trong một app',
    featuresSub: 'Cá nhân và kinh doanh dùng chung một trang Hôm nay. Mỗi khoản được phân loại rõ ràng để cuối tháng/cuối năm dễ xem lại.',
    f1: ['Trang Hôm nay', 'Mở app là thấy việc cần làm, hóa đơn sắp tới, chi tiêu trong tháng và gợi ý ngắn trong ngày.'],
    f2: ['Nhắc việc', 'Thêm nhanh bằng câu tự nhiên, hỗ trợ việc lặp lại, hóa đơn và nhắc cho người thân.'],
    f3: ['Chi tiêu', 'Ghi nhanh chi tiêu cá nhân và kinh doanh. Nhập tay cho nhẹ, rẻ và dễ kiểm soát.'],
    f4: ['Tổng kết', 'Gom số liệu theo tháng/năm để đưa cho người làm thuế. App không thay thế chuyên gia thuế.'],
    v1: ['Gói miễn phí vẫn dùng tốt', 'Có trang Hôm nay, nhắc việc, chi tiêu cơ bản và giới hạn rõ ràng.'],
    v2: ['AI dùng vừa đủ', 'Hỗ trợ hiểu câu nhắc tự nhiên và tạo gợi ý ngắn, không mở chatbot vô hạn.'],
    v3: ['Kiểm soát chi phí', 'Gợi ý trong ngày được lưu lại; không gọi AI mỗi lần mở app.'],
    mockToday: 'HÔM NAY', mockReminders: '3 việc cần nhớ', mockBill: 'Trả tiền điện lúc 9 giờ tối', mockMonth: 'THÁNG NÀY', mockExpense: 'Chi tiêu cá nhân + kinh doanh', mockInsight: 'GỢI Ý HÔM NAY', mockTip: 'Bạn có 2 hóa đơn sắp tới hạn. Ghi chi tiêu hôm nay để cuối tháng khỏi quên.',
  },
  en: {
    pricing: 'Pricing', login: 'Log in', start: 'Start free', plans: 'View pricing',
    badge: 'Daily life app for Vietnamese families in the U.S.',
    title: 'Open it daily. Remember less. Stay organized.',
    sub: 'Reminders, monthly bills, personal expenses, business expenses, and year-end summaries — simple enough to use every day.',
    note: 'No unlimited AI chat. No receipt scanning. No tax advice. Just practical daily tracking and summaries.',
    featuresTitle: 'Everything important in one simple app',
    featuresSub: 'Personal and business activity share one Today page. Categories keep your month and year-end records clean.',
    f1: ['Today page', 'Open the app and see today’s reminders, upcoming bills, monthly spending, and one helpful daily insight.'],
    f2: ['Reminders', 'Quick natural-language reminders with recurring tasks, bill reminders, and family reminders.'],
    f3: ['Expenses', 'Track personal and business expenses manually, keeping the app lightweight and affordable.'],
    f4: ['Summary', 'Monthly and yearly totals you can review or share with your tax preparer. No tax advice.'],
    v1: ['Free plan works', 'Today page, basic reminders, basic expenses, and clear limits.'],
    v2: ['Light AI only', 'Natural reminder parsing and short daily insights, without unlimited chatbot usage.'],
    v3: ['Cost controlled', 'Daily insight is cached; the app does not call AI every time it opens.'],
    mockToday: 'TODAY', mockReminders: '3 reminders', mockBill: 'Pay electric bill at 9 PM', mockMonth: 'THIS MONTH', mockExpense: 'Business + personal expenses', mockInsight: 'DAILY INSIGHT', mockTip: 'You have 2 bills coming up. Add today’s expenses so month-end is easier.',
  },
}

export default function Landing() {
  const { lang } = useLang()
  const c = copy[lang]
  return <div className="min-h-screen bg-white"><header className="absolute top-0 inset-x-0 z-20"><div className="container-app flex items-center justify-between h-16"><Logo /><div className="flex items-center gap-3"><Link to="/pricing" className="hidden sm:block text-sm font-semibold text-ink-700 hover:text-ink-900">{c.pricing}</Link><LanguageToggle /><Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">{c.login}</Link><Link to="/signup" className="btn-primary text-sm !px-4 !py-2">{c.start}</Link></div></div></header><section className="hero-gradient pt-32 pb-20 sm:pt-40 sm:pb-28"><div className="container-app"><div className="max-w-3xl mx-auto text-center animate-fade-up"><span className="badge bg-brand-50 text-brand-700 mb-5"><Sparkles className="w-3.5 h-3.5" /> {c.badge}</span><h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-900 leading-[1.05]">{c.title}</h1><p className="mt-5 text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto">{c.sub}</p><div className="mt-8 flex flex-col sm:flex-row justify-center gap-3"><Link to="/signup" className="btn-primary">{c.start} <ArrowRight className="w-4 h-4" /></Link><Link to="/pricing" className="btn-secondary">{c.plans}</Link></div><p className="mt-3 text-xs text-ink-400">{c.note}</p></div><HeroMock c={c} /></div></section><section className="py-20"><div className="container-app"><div className="max-w-2xl mx-auto text-center"><h2 className="text-3xl font-extrabold text-ink-900">{c.featuresTitle}</h2><p className="mt-3 text-ink-600">{c.featuresSub}</p></div><div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"><Feature icon={CalendarDays} title={c.f1[0]} text={c.f1[1]} /><Feature icon={Bell} title={c.f2[0]} text={c.f2[1]} /><Feature icon={Receipt} title={c.f3[0]} text={c.f3[1]} /><Feature icon={FileText} title={c.f4[0]} text={c.f4[1]} /></div></div></section><section className="py-16 bg-ink-50 border-y border-ink-100"><div className="container-app grid sm:grid-cols-3 gap-6"><Value icon={WalletCards} title={c.v1[0]} text={c.v1[1]} /><Value icon={Sparkles} title={c.v2[0]} text={c.v2[1]} /><Value icon={Shield} title={c.v3[0]} text={c.v3[1]} /></div></section><Footer /></div>
}
function HeroMock({ c }) { return <div className="mt-14 max-w-4xl mx-auto card p-4 sm:p-6 text-left"><div className="grid md:grid-cols-3 gap-3"><div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs font-bold text-brand-700">{c.mockToday}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">{c.mockReminders}</p><p className="text-sm text-ink-500">{c.mockBill}</p></div><div className="rounded-2xl bg-white border border-ink-100 p-4"><p className="text-xs font-bold text-ink-500">{c.mockMonth}</p><p className="mt-2 text-2xl font-extrabold text-ink-900">$1,240</p><p className="text-sm text-ink-500">{c.mockExpense}</p></div><div className="rounded-2xl bg-gold-500/10 p-4"><p className="text-xs font-bold text-gold-700">{c.mockInsight}</p><p className="mt-2 text-sm text-ink-700">{c.mockTip}</p></div></div></div> }
function Feature({ icon: Icon, title, text }) { return <div className="card p-5"><div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div><h3 className="mt-4 font-bold text-ink-900">{title}</h3><p className="mt-2 text-sm text-ink-500">{text}</p></div> }
function Value({ icon: Icon, title, text }) { return <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-white border border-ink-100 text-brand-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div><div><h3 className="font-bold text-ink-900">{title}</h3><p className="text-sm text-ink-500">{text}</p></div></div> }
