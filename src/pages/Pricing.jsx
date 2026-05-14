import { Link } from 'react-router-dom'
import { Check, X, Sparkles, Crown, ArrowRight, HelpCircle } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

export default function Pricing() {
  const { lang } = useLang()
  const isVi = lang === 'vi'

  const free = [
    { ok: true,  t: isVi ? 'Quản lý chi phí tiệm không giới hạn' : 'Unlimited business expenses' },
    { ok: true,  t: isVi ? 'Hóa đơn định kỳ' : 'Recurring bills' },
    { ok: true,  t: isVi ? 'Theo dõi 1099 & W-2 + xuất PDF' : '1099 & W-2 tracking + PDF export' },
    { ok: true,  t: isVi ? 'Quản lý cá nhân & nợ' : 'Personal finances & debt' },
    { ok: true,  t: isVi ? 'Schedule C tự động' : 'Auto-mapped Schedule C' },
    { ok: true,  t: isVi ? 'Song ngữ Anh–Việt' : 'Bilingual English & Vietnamese' },
    { ok: false, t: isVi ? 'AI đọc hóa đơn' : 'AI receipt scanning' },
    { ok: false, t: isVi ? 'Chat AI tiếng Việt' : 'Vietnamese AI chat' },
    { ok: false, t: isVi ? 'Cảnh báo chi tiêu thông minh' : 'Smart spending alerts' },
    { ok: false, t: isVi ? 'Gợi ý khấu trừ thuế' : 'Tax deduction suggestions' },
  ]
  const pro = [
    { ok: true, t: isVi ? 'Tất cả tính năng của Free' : 'Everything in Free' },
    { ok: true, t: isVi ? 'AI đọc hóa đơn (vendor, số tiền, loại)' : 'AI receipt scanner (vendor, total, category)' },
    { ok: true, t: isVi ? 'Chat AI tiếng Việt — hỏi gì cũng được' : 'AI chat in Vietnamese — ask anything' },
    { ok: true, t: isVi ? 'Cảnh báo chi tiêu bất thường' : 'Anomaly alerts on spending' },
    { ok: true, t: isVi ? 'Gợi ý khấu trừ & tax tips' : 'Tax tips & deductible suggestions' },
    { ok: true, t: isVi ? 'Lưu trữ hóa đơn không giới hạn' : 'Unlimited receipt storage' },
    { ok: true, t: isVi ? 'Hỗ trợ ưu tiên' : 'Priority support' },
  ]

  const faqs = isVi ? [
    { q: 'TxPick có thay thế kế toán không?', a: 'Không. TxPick giúp bạn ghi chép sạch sẽ và sẵn sàng cho kế toán. Cuối năm vẫn nên nhờ kế toán kiểm tra trước khi nộp.' },
    { q: 'Dữ liệu của tôi có an toàn không?', a: 'Dữ liệu được lưu trên Supabase với RLS (Row-Level Security) — chỉ bạn đăng nhập mới xem được data của mình. SSN nhân viên được mask, chỉ hiện 4 số cuối.' },
    { q: 'Tôi có thể hủy gói Pro bất cứ lúc nào không?', a: 'Có. Hủy bất cứ lúc nào, dùng đến hết chu kỳ đã trả tiền. Không tự gia hạn nếu bạn hủy.' },
    { q: 'AI có hiểu tiếng Việt không?', a: 'Có. Bạn có thể chat hoàn toàn bằng tiếng Việt. AI cũng đọc được hóa đơn tiếng Anh và Việt.' },
    { q: 'Có gói cho nhiều người dùng / nhân viên không?', a: 'Đang phát triển. Liên hệ hello@txpick.com nếu bạn cần phiên bản đa người dùng.' },
  ] : [
    { q: 'Does TxPick replace my accountant?', a: 'No. TxPick keeps your books clean and accountant-ready. You should still have a CPA review before filing.' },
    { q: 'Is my data safe?', a: 'Yes. Data is stored on Supabase with Row-Level Security — only you (when signed in) can read your own rows. Worker SSNs are masked; only the last 4 are visible.' },
    { q: 'Can I cancel Pro anytime?', a: 'Yes. Cancel anytime; access continues until the end of your billing period. No auto-renewal after cancellation.' },
    { q: 'Does the AI understand Vietnamese?', a: 'Yes. You can chat entirely in Vietnamese. The AI reads receipts in both English and Vietnamese.' },
    { q: 'Is there a team / multi-user plan?', a: 'Coming soon. Email hello@txpick.com if you need a multi-user version.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="container-app flex items-center justify-between h-16">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:block text-sm font-semibold text-ink-700 hover:text-ink-900">
              {isVi ? 'Trang chủ' : 'Home'}
            </Link>
            <LanguageToggle />
            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">
              {isVi ? 'Đăng nhập' : 'Log in'}
            </Link>
            <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">
              {isVi ? 'Bắt đầu' : 'Get started'}
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-gradient pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="container-app text-center max-w-2xl mx-auto">
          <span className="badge bg-brand-50 text-brand-700 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Pricing · Bảng giá
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink-900 leading-tight">
            {isVi ? 'Đơn giản. Minh bạch.' : 'Simple. Transparent.'}
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            {isVi
              ? 'Free đủ dùng cho tiệm nhỏ. Pro mở khóa AI khi bạn cần tiết kiệm thời gian.'
              : 'Free is enough for small shops. Pro unlocks AI when you want to save time.'}
          </p>
        </div>
      </section>

      <section className="pb-20 -mt-4">
        <div className="container-app grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Free */}
          <div className="card p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-ink-900">Free</h2>
              <span className="badge bg-ink-100 text-ink-700">{isVi ? 'Miễn phí' : 'Forever free'}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {isVi ? 'Cho chủ tiệm muốn tự làm sổ sách' : 'For shop owners who want to do it themselves'}
            </p>
            <div className="mt-5">
              <span className="text-5xl font-extrabold text-ink-900">$0</span>
              <span className="text-ink-500"> / {isVi ? 'mãi mãi' : 'forever'}</span>
            </div>
            <Link to="/signup" className="btn-secondary w-full mt-5">
              {isVi ? 'Đăng ký miễn phí' : 'Sign up free'}
            </Link>
            <ul className="mt-6 space-y-2.5 text-sm">
              {free.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  {f.ok
                    ? <Check className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    : <X className="w-4 h-4 text-ink-300 mt-0.5 flex-shrink-0" />}
                  <span className={f.ok ? 'text-ink-700' : 'text-ink-400 line-through'}>{f.t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="card p-7 relative overflow-hidden ring-2 ring-brand-500">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
                  <Crown className="w-6 h-6 text-gold-500" /> Pro
                </h2>
                <span className="badge bg-gold-500/10 text-gold-600">{isVi ? 'Phổ biến nhất' : 'Most popular'}</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {isVi ? 'Cho tiệm muốn AI làm phụ' : 'For shops that want AI to do the work'}
              </p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-ink-900">$9.99</span>
                <span className="text-ink-500"> / {isVi ? 'tháng' : 'month'}</span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {isVi ? 'Hủy bất cứ lúc nào.' : 'Cancel anytime.'}
              </p>
              <Link to="/signup" className="btn-primary w-full mt-5">
                <Crown className="w-4 h-4" /> {isVi ? 'Bắt đầu dùng Pro' : 'Start with Pro'} <ArrowRight className="w-4 h-4" />
              </Link>
              <ul className="mt-6 space-y-2.5 text-sm">
                {pro.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span className="text-ink-700">{f.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="container-app max-w-4xl mx-auto mt-14">
          <h3 className="text-xl font-bold text-ink-900 mb-4">
            {isVi ? 'So sánh chi tiết' : 'Compare side-by-side'}
          </h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3">{isVi ? 'Tính năng' : 'Feature'}</th>
                  <th className="text-center px-4 py-3">Free</th>
                  <th className="text-center px-4 py-3">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                <ComparisonRow label={isVi ? 'Quản lý chi phí tiệm' : 'Business expenses'} free pro />
                <ComparisonRow label={isVi ? 'Hóa đơn định kỳ' : 'Recurring bills'} free pro />
                <ComparisonRow label={isVi ? '1099 & W-2 + xuất PDF' : '1099 & W-2 + PDF export'} free pro />
                <ComparisonRow label={isVi ? 'Schedule C tự động' : 'Auto Schedule C'} free pro />
                <ComparisonRow label={isVi ? 'Quản lý cá nhân & nợ' : 'Personal finances & debt'} free pro />
                <ComparisonRow label={isVi ? 'Song ngữ Anh–Việt' : 'Bilingual EN/VI'} free pro />
                <ComparisonRow label={isVi ? 'AI đọc hóa đơn' : 'AI receipt scanner'} pro />
                <ComparisonRow label={isVi ? 'Chat AI tiếng Việt' : 'AI Vietnamese chat'} pro />
                <ComparisonRow label={isVi ? 'Cảnh báo chi tiêu' : 'Smart alerts'} pro />
                <ComparisonRow label={isVi ? 'Gợi ý khấu trừ thuế' : 'Tax tips'} pro />
                <ComparisonRow label={isVi ? 'Hỗ trợ ưu tiên' : 'Priority support'} pro />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="container-app max-w-3xl mx-auto mt-16">
          <h3 className="text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            {isVi ? 'Câu hỏi thường gặp' : 'Frequently asked questions'}
          </h3>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="card p-5 group">
                <summary className="cursor-pointer font-semibold text-ink-900 list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-ink-400 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ComparisonRow({ label, free = false, pro = false }) {
  return (
    <tr>
      <td className="px-4 py-3 text-ink-700">{label}</td>
      <td className="px-4 py-3 text-center">
        {free
          ? <Check className="w-4 h-4 text-brand-600 inline" />
          : <X className="w-4 h-4 text-ink-300 inline" />}
      </td>
      <td className="px-4 py-3 text-center bg-brand-50/30">
        {pro
          ? <Check className="w-4 h-4 text-brand-600 inline" />
          : <X className="w-4 h-4 text-ink-300 inline" />}
      </td>
    </tr>
  )
}
