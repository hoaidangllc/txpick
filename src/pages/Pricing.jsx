import { Check, Crown, X, ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    back: 'Quay lại',
    today: 'Về trang Hôm nay',
    title: 'Bảng giá đơn giản, không bất ngờ',
    sub: 'Không bán AI vô hạn, không scan hóa đơn, không tư vấn thuế. Chỉ tập trung vào điều bạn dùng mỗi ngày.',
    bill: 'Trả theo tháng • hủy bất cứ lúc nào',
    popular: 'Phổ biến nhất',
    current: 'Đang dùng gói này',
    pickFree: 'Bắt đầu miễn phí',
    pickPaid: 'Nâng cấp',
    plans: [
      { key: 'free', name: 'Miễn phí', price: '$0', priceUnit: '', sub: 'Đủ để dùng cơ bản mỗi ngày',
        features: ['Trang Hôm nay', 'Nhắc việc cơ bản', 'Chi tiêu cơ bản', 'Hóa đơn hằng tháng', 'Có quảng cáo nhỏ', 'Giới hạn lượt AI mỗi ngày'],
        missing: ['Xuất file cuối năm', 'Thông báo nâng cao', 'Nhắc cho gia đình'] },
      { key: 'basic', name: 'Pro Cơ Bản', price: '$1.99', priceUnit: '/tháng', sub: 'Tắt quảng cáo, mở rộng giới hạn',
        features: ['Không quảng cáo', 'Nhiều nhắc việc hơn', 'Nhiều chi tiêu hơn', 'Thêm lượt AI mỗi ngày', 'Giao diện gọn hơn'],
        missing: ['Không giới hạn dữ liệu', 'Tổng kết cuối năm'] },
      { key: 'premium', name: 'Pro Plus', price: '$4.99', priceUnit: '/tháng', sub: 'Phù hợp cho gia đình và cả tiệm/business',
        features: ['Không giới hạn nhắc việc', 'Không giới hạn chi tiêu', 'Tổng kết và xuất file cuối năm', 'Gợi ý thông minh', 'Nhắc cho người trong gia đình', 'Thông báo nâng cao'],
        missing: [] },
    ],
  },
  en: {
    back: 'Back',
    today: 'Go to Today',
    title: 'Simple pricing, no surprises',
    sub: 'No unlimited AI, no receipt scanning, no tax advice. Just the things you’ll actually use every day.',
    bill: 'Billed monthly • cancel anytime',
    popular: 'Most popular',
    current: 'Current plan',
    pickFree: 'Start free',
    pickPaid: 'Upgrade',
    plans: [
      { key: 'free', name: 'Free', price: '$0', priceUnit: '', sub: 'Everything you need for daily basics',
        features: ['Today page', 'Basic reminders', 'Basic expenses', 'Monthly bills', 'Small ad area', 'Limited AI actions per day'],
        missing: ['Year-end export', 'Advanced notifications', 'Family reminders'] },
      { key: 'basic', name: 'Pro Basic', price: '$1.99', priceUnit: '/mo', sub: 'Remove ads, raise the limits',
        features: ['No ads', 'More reminders', 'More expenses', 'More AI actions per day', 'A cleaner experience'],
        missing: ['Unlimited records', 'Year-end summary'] },
      { key: 'premium', name: 'Pro Plus', price: '$4.99', priceUnit: '/mo', sub: 'Best for family + business owners',
        features: ['Unlimited reminders', 'Unlimited expenses', 'Year-end summary & export', 'Smart insights', 'Reminders for family', 'Advanced notifications'],
        missing: [] },
    ],
  },
}

export default function Pricing() {
  const [planKey, api] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const { lang } = useLang()
  const navigate = useNavigate()
  const c = copy[lang]
  const choosePlan = (key) => { api.setValue(key); if (window.history.length > 1) navigate('/today') }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center justify-between h-16">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/today" className="btn-secondary !py-2 text-sm">{c.today}</Link>
          </div>
        </div>
      </header>
      <main className="container-app py-8 sm:py-12">
        <Link to="/today" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="w-4 h-4" /> {c.back}
        </Link>
        <div className="text-center max-w-2xl mx-auto mt-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 leading-tight">{c.title}</h1>
          <p className="mt-3 text-ink-600">{c.sub}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-400">{c.bill}</p>
        </div>
        <div className="mt-10 grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {c.plans.map((p) => {
            const isCurrent = planKey === p.key
            const isPopular = p.key === 'premium'
            return (
              <div key={p.key} className={`card p-6 relative flex flex-col ${isPopular ? 'ring-2 ring-brand-500 shadow-glow' : ''}`}>
                {isPopular && (
                  <span className="absolute -top-3 right-6 badge bg-brand-600 text-white shadow-soft">
                    <Sparkles className="w-3 h-3" /> {c.popular}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-ink-900">{p.name}</h2>
                  {p.key !== 'free' && <Crown className="w-5 h-5 text-gold-600" />}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink-900">{p.price}</span>
                  {p.priceUnit && <span className="text-sm font-semibold text-ink-500">{p.priceUnit}</span>}
                </div>
                <p className="text-sm text-ink-500 mt-1">{p.sub}</p>
                <button onClick={() => choosePlan(p.key)} className={`mt-5 w-full ${isCurrent ? 'btn-secondary' : 'btn-primary'}`} disabled={isCurrent}>
                  {isCurrent ? c.current : (p.key === 'free' ? c.pickFree : c.pickPaid)}
                </button>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-ink-700">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {p.missing.map((f) => (
                    <li key={f} className="flex gap-2 text-ink-400">
                      <X className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
