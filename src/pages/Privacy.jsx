import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Chính sách bảo mật',
    updated: 'Cập nhật: Tháng 5, 2026',
    intro: 'TXPick được thiết kế để giúp bạn quản lý nhắc việc, hóa đơn, chi tiêu cá nhân, hồ sơ business, 1099/W-2 và tổng kết cuối năm. Trang này giải thích ngắn gọn dữ liệu nào được lưu và cách chúng tôi bảo vệ dữ liệu đó.',
    sections: [
      ['Dữ liệu bạn nhập', 'TXPick có thể lưu tên hiển thị, email đăng nhập, nhắc việc, hóa đơn, chi tiêu, tên business, thông tin worker 1099/W-2, ghi chú và góp ý bạn gửi.'],
      ['Thông báo trên điện thoại', 'Nếu bạn bật notification, TXPick lưu subscription của thiết bị để gửi nhắc việc đúng giờ. Bạn có thể tắt trong Cài đặt hoặc trong cài đặt trình duyệt/điện thoại.'],
      ['Google login', 'Nếu bạn đăng nhập bằng Google, TXPick dùng email và tên cơ bản để tạo tài khoản và hiển thị trong app.'],
      ['Không bán dữ liệu cá nhân', 'TXPick không bán dữ liệu cá nhân của bạn. Dữ liệu được dùng để vận hành app và cải thiện trải nghiệm.'],
      ['Bảo mật', 'Dữ liệu người dùng được bảo vệ bằng Supabase Auth và Row Level Security. Mỗi user chỉ nên thấy dữ liệu của chính mình.'],
      ['Xuất hoặc xóa dữ liệu', 'Bạn có thể xuất thông tin business/tax trong app. Nếu cần xóa tài khoản hoặc dữ liệu, hãy liên hệ qua email hỗ trợ.'],
      ['Lưu ý về thuế', 'TXPick giúp sắp xếp hồ sơ và tổng kết dữ liệu. TXPick không thay thế CPA, kế toán, luật sư hoặc chuyên gia thuế.'],
    ],
    back: 'Về trang chủ',
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Updated: May 2026',
    intro: 'TXPick is built to help you manage reminders, bills, personal expenses, business records, 1099/W-2 information, and year-end summaries. This page explains what data may be stored and how it is protected.',
    sections: [
      ['Data you enter', 'TXPick may store your display name, login email, reminders, bills, expenses, business name, 1099/W-2 worker records, notes, and feedback you send.'],
      ['Phone notifications', 'If you enable notifications, TXPick stores your device subscription so reminders can be sent on time. You can turn this off in Settings or in your browser/phone settings.'],
      ['Google login', 'If you sign in with Google, TXPick uses basic account details such as your email and name to create and show your account.'],
      ['No sale of personal data', 'TXPick does not sell your personal data. Data is used to operate the app and improve the experience.'],
      ['Security', 'User data is protected with Supabase Auth and Row Level Security. Each user should only access their own data.'],
      ['Export or delete data', 'You can export business/tax information inside the app. To delete an account or data, contact support.'],
      ['Tax note', 'TXPick helps organize records and summaries. TXPick does not replace a CPA, accountant, attorney, or tax professional.'],
    ],
    back: 'Back home',
  },
}

export default function Privacy() {
  const { lang } = useLang()
  const c = copy[lang] || copy.en
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="container-app flex items-center justify-between h-16">
        <Link to="/"><Logo /></Link>
        <LanguageToggle />
      </header>
      <main className="container-app flex-1 py-10">
        <article className="max-w-3xl mx-auto card p-6 sm:p-8">
          <p className="text-sm font-semibold text-brand-700">TXPick</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink-900">{c.title}</h1>
          <p className="mt-1 text-sm text-ink-400">{c.updated}</p>
          <p className="mt-5 text-ink-600 leading-relaxed">{c.intro}</p>
          <div className="mt-7 space-y-5">
            {c.sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="font-bold text-ink-900">{title}</h2>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">{text}</p>
              </section>
            ))}
          </div>
          <Link to="/" className="btn-primary mt-8">{c.back}</Link>
        </article>
      </main>
      <Footer />
    </div>
  )
}
