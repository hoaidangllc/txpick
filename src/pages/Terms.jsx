import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Điều khoản sử dụng',
    updated: 'Cập nhật: Tháng 5, 2026',
    intro: 'Khi dùng TXPick, bạn đồng ý sử dụng app để tự quản lý nhắc việc, hóa đơn, chi tiêu và hồ sơ business của mình một cách hợp pháp và có trách nhiệm.',
    sections: [
      ['Mục đích app', 'TXPick là công cụ sắp xếp đời sống cá nhân và business. App không phải phần mềm kế toán đầy đủ và không thay thế chuyên gia thuế.'],
      ['Dữ liệu bạn nhập', 'Bạn chịu trách nhiệm về độ chính xác của thông tin bạn nhập, bao gồm số tiền, ngày, worker, SSN/Tax ID và ghi chú.'],
      ['Thông báo', 'Notification phụ thuộc vào thiết bị, trình duyệt, quyền thông báo, kết nối mạng và hệ thống push. TXPick cố gắng nhắc đúng giờ nhưng bạn vẫn nên kiểm tra các việc quan trọng.'],
      ['Không tư vấn thuế/pháp lý', 'Các tổng kết và export chỉ để hỗ trợ chuẩn bị hồ sơ. Hãy hỏi CPA, kế toán, luật sư hoặc chuyên gia thuế trước khi nộp hồ sơ chính thức.'],
      ['Tài khoản', 'Bạn cần bảo vệ tài khoản Google/email của mình. Nếu nghi ngờ bị truy cập trái phép, hãy đổi mật khẩu và liên hệ hỗ trợ.'],
      ['Thay đổi app', 'TXPick có thể thay đổi tính năng, giao diện hoặc điều khoản để cải thiện sản phẩm và bảo mật.'],
    ],
    back: 'Về trang chủ',
  },
  en: {
    title: 'Terms of Use',
    updated: 'Updated: May 2026',
    intro: 'By using TXPick, you agree to use the app to manage your own reminders, bills, expenses, and business records lawfully and responsibly.',
    sections: [
      ['Purpose', 'TXPick is a personal and business organizer. It is not full accounting software and does not replace a tax professional.'],
      ['Your data entry', 'You are responsible for the accuracy of information you enter, including amounts, dates, workers, SSN/Tax ID, and notes.'],
      ['Notifications', 'Notifications depend on device, browser, permission, network, and push systems. TXPick works to remind you on time, but you should still verify critical tasks.'],
      ['No tax/legal advice', 'Summaries and exports are for organizing records. Ask a CPA, accountant, attorney, or tax professional before filing official documents.'],
      ['Account security', 'You are responsible for protecting your Google/email account. If you suspect unauthorized access, change your password and contact support.'],
      ['Changes', 'TXPick may change features, design, or terms to improve the product and security.'],
    ],
    back: 'Back home',
  },
}

export default function Terms() {
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
