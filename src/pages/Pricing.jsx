import { Check, Crown, X, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useLocalStore } from '../lib/useLocalStore.js'
import { STORAGE_KEYS } from '../lib/lifeStore.js'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    back: 'Quay lại', today: 'Về trang Hôm nay', title: 'Bảng giá đơn giản', sub: 'Không bán AI vô hạn. Gói rõ ràng, dễ hiểu, phù hợp để dùng mỗi ngày.', current: 'Gói hiện tại', use: 'Chọn gói này',
    plans: [
      { key: 'free', name: 'Miễn phí', price: '$0', sub: 'Dùng cơ bản mỗi ngày', features: ['Nhắc việc cơ bản', 'Chi tiêu cơ bản', 'Trang Hôm nay', 'Quảng cáo nhẹ', 'Giới hạn lượt AI'], missing: ['Xuất file cuối năm', 'Thông báo nâng cao'] },
      { key: 'basic', name: 'Pro Cơ Bản', price: '$1.99/tháng', sub: 'Tắt quảng cáo + thêm giới hạn', features: ['Không quảng cáo', 'Nhiều nhắc việc hơn', 'Nhiều chi tiêu hơn', 'Nhiều lượt AI hơn', 'Trải nghiệm gọn hơn'], missing: ['Không giới hạn dữ liệu'] },
      { key: 'premium', name: 'Pro Plus', price: '$4.99/tháng', sub: 'Phù hợp cho gia đình + kinh doanh', features: ['Không giới hạn nhắc việc', 'Không giới hạn chi tiêu', 'Tổng kết/xuất file cuối năm', 'Gợi ý thông minh', 'Nhắc cho gia đình', 'Thông báo nâng cao'], missing: [] },
    ],
  },
  en: {
    back: 'Back', today: 'Go to Today', title: 'Simple pricing', sub: 'No unlimited AI. Clear plans, clear limits, useful daily tracking.', current: 'Current plan', use: 'Use this plan',
    plans: [
      { key: 'free', name: 'Free', price: '$0', sub: 'Basic daily use', features: ['Basic reminders', 'Basic expenses', 'Today page', 'Light ads', 'Limited AI actions'], missing: ['Yearly export', 'Advanced notifications'] },
      { key: 'basic', name: 'Pro Basic', price: '$1.99/mo', sub: 'Remove ads + higher limits', features: ['No ads', 'More reminders', 'More expenses', 'More AI actions', 'Cleaner experience'], missing: ['Unlimited records'] },
      { key: 'premium', name: 'Pro Plus', price: '$4.99/mo', sub: 'Best for family + business', features: ['Unlimited reminders', 'Unlimited expenses', 'Yearly summary/export', 'Smart insights', 'Family reminders', 'Advanced notifications'], missing: [] },
    ],
  },
}

export default function Pricing() {
  const [planKey, api] = useLocalStore(STORAGE_KEYS.plan, 'free')
  const { lang } = useLang()
  const navigate = useNavigate()
  const c = copy[lang]
  const choosePlan = (key) => {
    api.setValue(key)
    if (window.history.length > 1) navigate('/today')
  }
  return <div className="min-h-screen bg-ink-50"><header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100"><div className="container-app flex items-center justify-between h-16"><Logo /><div className="flex items-center gap-2"><LanguageToggle /><Link to="/today" className="btn-secondary !py-2 text-sm">{c.today}</Link></div></div></header><main className="container-app py-8 sm:py-10"><Link to="/today" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft className="w-4 h-4" /> {c.back}</Link><div className="text-center max-w-2xl mx-auto"><h1 className="text-4xl font-extrabold text-ink-900">{c.title}</h1><p className="mt-3 text-ink-600">{c.sub}</p></div><div className="mt-8 grid lg:grid-cols-3 gap-5">{c.plans.map((p) => <div key={p.key} className={`card p-6 ${p.key === 'premium' ? 'ring-2 ring-brand-500' : ''}`}><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-ink-900">{p.name}</h2>{p.key !== 'free' && <Crown className="w-5 h-5 text-gold-600" />}</div><p className="mt-2 text-3xl font-extrabold text-ink-900">{p.price}</p><p className="text-sm text-ink-500">{p.sub}</p><button onClick={() => choosePlan(p.key)} className={`mt-5 w-full ${planKey === p.key ? 'btn-secondary' : 'btn-primary'}`}>{planKey === p.key ? c.current : c.use}</button><ul className="mt-5 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-brand-600" /> {f}</li>)}{p.missing.map((f) => <li key={f} className="flex gap-2 text-ink-400"><X className="w-4 h-4" /> {f}</li>)}</ul></div>)}</div></main></div>
}
