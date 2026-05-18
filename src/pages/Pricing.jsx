import { Check, Crown, ArrowLeft, Sparkles, Clock3 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Modal from '../components/Modal.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { trackEvent } from '../lib/analytics.js'

const copy = {
  vi: {
    back: 'Quay lại',
    today: 'Về Hôm nay',
    title: 'Gói nâng cấp đang chuẩn bị',
    sub: 'Public beta hiện chưa thu tiền. Bảng này giúp user hiểu hướng Free, Plus và Pro trước khi bật thanh toán thật.',
    bill: 'Launching Soon • chưa Stripe • chưa subscription thật',
    popular: 'Dành cho chủ tiệm / Uber / DoorDash',
    current: 'Gói hiện tại',
    pickFree: 'Giữ gói Free',
    pickPaid: 'Sắp ra mắt',
    confirmTitle: 'Đã giữ gói Free',
    confirmText: 'TXPick hiện đang ở public beta. Plus và Pro sẽ mở sau khi tính năng ổn định hơn.',
    close: 'Đóng',
    selected: 'Bạn đang xem',
    soon: 'Launching Soon',
    noCharge: 'Chưa thu tiền',
    plans: [
      { key: 'free', name: 'Free', price: '$0', priceUnit: '', sub: 'Đủ để bắt đầu dùng mỗi ngày',
        features: ['Trang Hôm nay', 'Nhắc việc cơ bản', 'Chi tiêu cá nhân cơ bản', 'Hóa đơn hằng tháng', 'Smart Assistant giới hạn', 'Quảng cáo nhẹ sau này'],
        bestFor: 'Người mới muốn thử app trước.' },
      { key: 'plus', name: 'Plus', price: '$1.99', priceUnit: '/tháng', sub: 'Cho cá nhân muốn app gọn hơn và ít giới hạn hơn',
        features: ['Bỏ quảng cáo', 'Nhiều lượt Smart Assistant hơn', 'Nhiều nhắc việc hơn', 'Tổng kết tháng rõ hơn', 'Xuất CSV cơ bản'],
        bestFor: 'Gia đình nhỏ hoặc người dùng cá nhân.' },
      { key: 'pro', name: 'Pro', price: '$4.99', priceUnit: '/tháng', sub: 'Cho chủ tiệm, Uber/DoorDash và business nhỏ',
        features: ['Business mode đầy đủ', 'Tax summary mạnh hơn', 'Xuất tổng kết cho người làm thuế', 'Assistant mạnh hơn', 'Ưu tiên công cụ cho chủ business'],
        bestFor: 'Chủ tiệm, gig worker, gia đình có nhiều khoản cần theo dõi.' },
    ],
  },
  en: {
    back: 'Back',
    today: 'Go to Today',
    title: 'Upgrade plans are being prepared',
    sub: 'Public beta does not charge yet. This page explains the Free, Plus, and Pro direction before real billing is enabled.',
    bill: 'Launching Soon • no Stripe • no real subscription yet',
    popular: 'For owners / Uber / DoorDash',
    current: 'Current plan',
    pickFree: 'Keep Free',
    pickPaid: 'Launching Soon',
    confirmTitle: 'Free plan kept',
    confirmText: 'TXPick is still in public beta. Plus and Pro will open after the core experience is more stable.',
    close: 'Close',
    selected: 'Viewing',
    soon: 'Launching Soon',
    noCharge: 'No charge yet',
    plans: [
      { key: 'free', name: 'Free', price: '$0', priceUnit: '', sub: 'Enough to start using it daily',
        features: ['Today page', 'Basic reminders', 'Basic personal expenses', 'Monthly bills', 'Limited Smart Assistant', 'Light ads later'],
        bestFor: 'New users who want to try the app first.' },
      { key: 'plus', name: 'Plus', price: '$1.99', priceUnit: '/mo', sub: 'For personal users who want a cleaner app with fewer limits',
        features: ['Remove ads', 'More Smart Assistant usage', 'More reminders', 'Clearer monthly summary', 'Basic CSV export'],
        bestFor: 'Personal users and small families.' },
      { key: 'pro', name: 'Pro', price: '$4.99', priceUnit: '/mo', sub: 'For nail salons, Uber/DoorDash, and small business',
        features: ['Full business mode', 'Stronger tax summary', 'Tax-preparer export summary', 'Stronger assistant', 'Business-owner tools first'],
        bestFor: 'Business owners, gig workers, and families with more to track.' },
    ],
  },
}

export default function Pricing() {
  const { profile, updateProfile, user } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const c = copy[lang]
  const initialPlan = profile?.plan_key || profile?.plan || 'free'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [modalPlan, setModalPlan] = useState(null)
  const selected = useMemo(() => c.plans.find((p) => p.key === selectedPlan) || c.plans[0], [c.plans, selectedPlan])

  const choosePlan = async (plan) => {
    trackEvent(user?.id, 'pricing_plan_clicked', { plan: plan.key, launching_soon: plan.key !== 'free' })
    if (plan.key !== 'free') {
      setModalPlan(plan)
      return
    }
    setSelectedPlan(plan.key)
    await updateProfile?.({ is_pro: false, plan_key: 'free', plan: 'free' })
    setModalPlan(plan)
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
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
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700"><Clock3 className="w-3.5 h-3.5" /> {c.bill}</p>
        </div>
        <div className="mt-10 grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {c.plans.map((p) => {
            const isCurrent = selectedPlan === p.key
            const isPaid = p.key !== 'free'
            const isPopular = p.key === 'pro'
            return (
              <div key={p.key} className={`card p-6 relative flex flex-col transition ${isCurrent ? 'ring-2 ring-brand-600 bg-brand-50/70 shadow-glow' : ''} ${isPopular && !isCurrent ? 'ring-2 ring-brand-200' : ''}`}>
                {isPopular && (
                  <span className="absolute -top-3 right-6 badge bg-brand-600 text-white shadow-soft">
                    <Sparkles className="w-3 h-3" /> {c.popular}
                  </span>
                )}
                {isPaid && (
                  <span className="absolute top-4 right-4 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700 border border-amber-100">{c.soon}</span>
                )}
                <div className="flex items-center justify-between pr-24">
                  <h2 className="text-xl font-extrabold text-ink-900">{p.name}</h2>
                  {isPaid && <Crown className="w-5 h-5 text-gold-600" />}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink-900">{p.price}</span>
                  {p.priceUnit && <span className="text-sm font-semibold text-ink-500">{p.priceUnit}</span>}
                </div>
                <p className="text-sm text-ink-500 mt-1 min-h-[40px]">{p.sub}</p>
                <p className="mt-4 rounded-xl bg-white/70 border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-600">{p.bestFor}</p>
                <button onClick={() => choosePlan(p)} className={`mt-5 w-full ${isCurrent ? 'btn-secondary' : isPaid ? 'btn-secondary' : 'btn-primary'}`}>
                  {isCurrent ? c.current : (p.key === 'free' ? c.pickFree : c.pickPaid)}
                </button>
                {isPaid && <p className="mt-2 text-center text-xs font-semibold text-ink-400">{c.noCharge}</p>}
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-ink-700">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </main>

      <Modal open={Boolean(modalPlan)} onClose={() => setModalPlan(null)} title={modalPlan ? `${c.selected}: ${modalPlan.name}` : c.confirmTitle} footer={<><button className="btn-secondary" onClick={() => setModalPlan(null)}>{c.close}</button><button className="btn-primary" onClick={() => navigate('/today')}>{c.today}</button></>}>
        <p className="text-sm text-ink-600">{c.confirmText}</p>
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
