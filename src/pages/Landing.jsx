import { Link } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, FileText, Receipt, Shield, Sparkles, WalletCards } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    pricing: 'Bảng giá', login: 'Đăng nhập', start: 'Bắt đầu miễn phí', plans: 'Xem gói',
    badge: 'App quản lý đời sống hằng ngày cho người Việt ở Mỹ',
    title: 'Mở app mỗi ngày. Nhớ ít hơn. Quản lý gọn hơn.',
    sub: 'Nhắc việc, hóa đơn hằng tháng, chi tiêu cá nhân, chi tiêu kinh doanh và tổng kết cuối năm — đơn giản để dùng mỗi ngày.',
    note: 'Không chat AI vô hạn. Không scan hóa đơn. Không tư vấn thuế. Chỉ tập trung vào việc ghi nhớ và tổng kết thực tế.',
    featuresTitle: 'Những phần chính',
    featuresSub: 'Cá nhân và kinh doanh dùng chung một trang Hôm nay. Mỗi mục được phân loại rõ ràng.',
    f1: ['Trang Hôm nay', 'Màn hình chính sau khi đăng nhập: việc cần nhớ, hóa đơn, chi tiêu và gợi ý trong ngày.'],
    f2: ['Nhắc việc', 'Thêm nhanh bằng câu tự nhiên, việc lặp lại, nhắc cho gia đình và nhắc hóa đơn.'],
    f3: ['Chi tiêu', 'Nhập tay chi tiêu cá nhân và kinh doanh. Nhanh, dễ dùng và không tốn phí AI.'],
    f4: ['Tổng kết', 'Gom số liệu theo tháng và theo năm để đưa cho người làm thuế. Không tư vấn thuế.'],
    v1: ['Gói miễn phí vẫn dùng được', 'Nhắc việc, chi tiêu, trang Hôm nay và giới hạn nhẹ.'],
    v2: ['AI dùng vừa đủ', 'Hiểu câu nhắc tự nhiên, tạo gợi ý hằng ngày và giới hạn lượt dùng.'],
    v3: ['Kiểm soát chi phí', 'Gợi ý trong ngày được lưu lại; không gọi AI mỗi lần mở app.'],
    mockToday: 'HÔM NAY', mockReminders: '3 việc cần nhớ', mockBill: 'Trả tiền điện lúc 9 PM', mockMonth: 'THÁNG NÀY', mockExpense: 'Chi tiêu cá nhân + kinh doanh', mockInsight: 'GỢI Ý HÔM NAY', mockTip: 'Bạn có 2 hóa đơn sắp tới hạn. Nhập chi tiêu hôm nay để cuối tháng khỏi quên.',
  },
  en: {
    pricing: 'Pricing', login: 'Log in', start: 'Start free', plans: 'View plans',
    badge: 'Daily life app for Vietnamese in the U.S.',
    title: 'Open it every day. Remember less. Track better.',
    sub: 'Reminders, monthly bills, personal expenses, business expenses, and year-end summaries — simple enough to use every day.',
    note: 'No unlimited AI chat. No receipt scan. No tax advice. Just practical daily tracking.',
    featuresTitle: 'Core features',
    featuresSub: 'Personal and business share one Today page. Categories keep everything organized.',
    f1: ['Today page', 'The home screen after login: reminders, bills, expenses, and daily insight.'],
    f2: ['Reminders', 'Quick natural entry, recurring tasks, family reminders, and bill reminders.'],
    f3: ['Expenses', 'Manual personal and business expense tracking. Fast and affordable to run.'],
    f4: ['Summary', 'Monthly and yearly totals you can hand to your tax preparer. No tax advice.'],
    v1: ['Free works', 'Basic reminders, expenses, Today page, and light limits.'],
    v2: ['AI is light', 'Natural reminder parsing, daily insight, and limited smart actions.'],
    v3: ['Cost controlled', 'Daily summary is cached; no AI call every time the app opens.'],
    mockToday: 'TODAY', mockReminders: '3 reminders', mockBill: 'Pay electric bill at 9 PM', mockMonth: 'THIS MONTH', mockExpense: 'Business + personal expenses', mockInsight: 'SMART INSIGHT', mockTip: 'You have 2 bills due soon. Add today’s expenses before you forget.',
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
