import { Check, Crown, X, ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Modal from '../components/Modal.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const copy = {
  vi: {
    back: 'Quay lại',
    today: 'Về trang Hôm nay',
    title: 'Chọn gói phù hợp với cách bạn dùng app',
    sub: 'Miễn phí để theo dõi hằng ngày. Plus cho cá nhân dùng nhiều hơn. Pro cho business, W2, 1099 và xuất file cuối năm.',
    bill: 'Trả theo tháng • hủy bất cứ lúc nào',
    popular: 'Phù hợp nhất cho business',
    current: 'Gói đang chọn',
    pickFree: 'Chọn miễn phí',
    pickPaid: 'Chọn gói này',
    coming: 'Thanh toán sẽ được bật sau',
    comingText: 'Hiện tại app đang cho chọn gói để test giao diện và tính năng. Stripe/payment sẽ gắn sau khi app ổn định.',
    close: 'Đóng',
    selected: 'Bạn đã chọn',
    plans: [
      { key: 'free', name: 'Miễn phí', price: '$0', priceUnit: '', sub: 'Đủ để dùng cơ bản mỗi ngày',
        features: ['Trang Hôm nay', 'Nhắc việc cơ bản', 'Chi tiêu cá nhân cơ bản', 'Hóa đơn hằng tháng', 'Tổng kết đơn giản'],
        missing: ['W2 / 1099', 'Xuất file cuối năm', 'Business tax report'] },
      { key: 'basic', name: 'Plus', price: '$1.99', priceUnit: '/tháng', sub: 'Cho cá nhân muốn theo dõi nhiều hơn',
        features: ['Không quảng cáo', 'Nhiều nhắc việc hơn', 'Nhiều chi tiêu hơn', 'CSV/PDF export cơ bản', 'Tổng kết tháng rõ hơn'],
        missing: ['W2 / 1099 đầy đủ', 'Business tax report nâng cao'] },
      { key: 'premium', name: 'Pro', price: '$4.99', priceUnit: '/tháng', sub: 'Cho gia đình, tiệm nail, Uber/DoorDash và business',
        features: ['Không giới hạn nhắc việc', 'Không giới hạn chi tiêu', 'W2 Employees', '1099 Contractors', 'Business expenses', 'Year-end tax export', 'Personal/business split'],
        missing: [] },
    ],
  },
  en: {
    back: 'Back',
    today: 'Go to Today',
    title: 'Choose the plan that fits how you use the app',
    sub: 'Free for daily tracking. Plus for heavier personal use. Pro for business, W2, 1099, and year-end exports.',
    bill: 'Billed monthly • cancel anytime',
    popular: 'Best for business',
    current: 'Selected plan',
    pickFree: 'Choose free',
    pickPaid: 'Choose this plan',
    coming: 'Payment coming soon',
    comingText: 'Plan selection is available now for testing the app experience. Stripe/payment will be connected after the product is stable.',
    close: 'Close',
    selected: 'You selected',
    plans: [
      { key: 'free', name: 'Free', price: '$0', priceUnit: '', sub: 'Daily basics to get started',
        features: ['Today page', 'Basic reminders', 'Basic personal expenses', 'Monthly bills', 'Simple summary'],
        missing: ['W2 / 1099', 'Year-end export', 'Business tax report'] },
      { key: 'basic', name: 'Plus', price: '$1.99', priceUnit: '/mo', sub: 'For personal users who track more',
        features: ['No ads', 'More reminders', 'More expenses', 'Basic CSV/PDF export', 'Better monthly summary'],
        missing: ['Full W2 / 1099', 'Advanced business tax report'] },
      { key: 'premium', name: 'Pro', price: '$4.99', priceUnit: '/mo', sub: 'For family, nail salon, Uber/DoorDash, and business use',
        features: ['Unlimited reminders', 'Unlimited expenses', 'W2 Employees', '1099 Contractors', 'Business expenses', 'Year-end tax export', 'Personal/business split'],
        missing: [] },
    ],
  },
}

export default function Pricing() {
  const { profile, updateProfile } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const c = copy[lang]
  const initialPlan = profile?.plan_key || (profile?.is_pro ? 'premium' : 'free')
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [modalPlan, setModalPlan] = useState(null)
  const selected = useMemo(() => c.plans.find((p) => p.key === selectedPlan) || c.plans[0], [c.plans, selectedPlan])

  const choosePlan = async (plan) => {
    setSelectedPlan(plan.key)
    await updateProfile?.({ is_pro: plan.key !== 'free', plan_key: plan.key })
    setModalPlan(plan)
  }

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
            const isCurrent = selectedPlan === p.key
            const isPopular = p.key === 'premium'
            return (
              <div key={p.key} className={`card p-6 relative flex flex-col transition ${isCurrent ? 'ring-2 ring-brand-600 bg-brand-50/70 shadow-glow' : ''} ${isPopular && !isCurrent ? 'ring-2 ring-brand-200' : ''}`}>
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
                <button onClick={() => choosePlan(p)} className={`mt-5 w-full ${isCurrent ? 'btn-secondary' : 'btn-primary'}`}>
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

      <Modal open={Boolean(modalPlan)} onClose={() => setModalPlan(null)} title={modalPlan ? `${c.selected}: ${modalPlan.name}` : c.coming} footer={<><button className="btn-secondary" onClick={() => setModalPlan(null)}>{c.close}</button><button className="btn-primary" onClick={() => navigate('/today')}>{c.today}</button></>}>
        <p className="text-sm text-ink-600">{c.comingText}</p>
        <div className="mt-4 rounded-2xl bg-brand-50 border border-brand-100 p-4">
          <p className="font-bold text-brand-900">{selected.name} {selected.price}{selected.priceUnit}</p>
          <ul className="mt-2 space-y-1 text-sm text-brand-800">
            {selected.features.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        </div>
      </Modal>
    </div>
  )
}
