import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, User, FileText, Sparkles, ArrowRight, CheckCircle2,
  Shield, Globe2, Smartphone, Receipt, Bell, Wallet,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import Footer from '../components/Footer.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js'

export default function Landing() {
  const { t, lang } = useLang()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    try {
      const list = JSON.parse(localStorage.getItem('txpick_waitlist') || '[]')
      list.push({ email, lang, at: new Date().toISOString() })
      localStorage.setItem('txpick_waitlist', JSON.stringify(list))
    } catch {}
    if (SUPABASE_CONFIGURED) {
      try {
        await supabase.from('waitlist').insert({ email, locale: lang, source: 'landing' })
      } catch {}
    }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block text-sm font-semibold text-ink-700 hover:text-ink-900">
              {t.nav.features}
            </a>
            <Link to="/pricing" className="hidden sm:block text-sm font-semibold text-ink-700 hover:text-ink-900">
              {t.nav.pricing}
            </Link>
            <LanguageToggle />
            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">
              {t.nav.login}
            </Link>
            <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-gradient pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <span className="badge bg-brand-50 text-brand-700 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> {t.hero.eyebrow}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-900 leading-[1.05]">
              {t.taglineMain}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto">
              {t.taglineSub}
            </p>

            <form onSubmit={handleWaitlist} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.waitlist.placeholder}
                className="input flex-1"
                required
                aria-label="Email"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                {t.hero.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {submitted && (
              <p className="mt-3 text-sm text-brand-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t.waitlist.success}
              </p>
            )}
            <p className="mt-2 text-xs text-ink-400">{t.waitlist.privacy}</p>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><Globe2 className="w-4 h-4" /> {t.hero.stat1}</span>
              <span className="inline-flex items-center gap-1.5"><FileText className="w-4 h-4" /> {t.hero.stat2}</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> {t.hero.stat3}</span>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <HeroMock />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-28">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900">{t.features.title}</h2>
            <p className="mt-3 text-ink-600">{t.features.sub}</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Briefcase}
              tone="brand"
              title={t.features.business.title}
              sub={t.features.business.sub}
              bullets={[
                lang === 'vi' ? 'Chi phí song ngữ' : 'Bilingual expenses',
                lang === 'vi' ? 'Hóa đơn định kỳ' : 'Recurring bills',
                lang === 'vi' ? 'Thợ 1099 + W-2' : '1099 + W-2 workers',
              ]}
            />
            <FeatureCard
              icon={User}
              tone="ink"
              title={t.features.personal.title}
              sub={t.features.personal.sub}
              bullets={[
                lang === 'vi' ? 'Hóa đơn cá nhân' : 'Personal bills',
                lang === 'vi' ? 'Nợ & vay' : 'Debt & loans',
                lang === 'vi' ? 'Nhắc lịch thuế' : 'Tax reminders',
              ]}
            />
            <FeatureCard
              icon={FileText}
              tone="brand"
              title={t.features.tax.title}
              sub={t.features.tax.sub}
              bullets={['Schedule C', '1099-NEC + W-2', lang === 'vi' ? 'Xuất PDF' : 'PDF export']}
            />
            <FeatureCard
              icon={Sparkles}
              tone="gold"
              title={t.features.ai.title}
              sub={t.features.ai.sub}
              badge={t.features.ai.badge}
              bullets={[
                lang === 'vi' ? 'Chụp hóa đơn' : 'Scan receipts',
                lang === 'vi' ? 'Chat tiếng Việt' : 'Vietnamese chat',
                lang === 'vi' ? 'Cảnh báo chi tiêu' : 'Spending alerts',
              ]}
            />
          </div>

          <div className="mt-10 text-center">
            <Link to="/pricing" className="btn-secondary">
              {lang === 'vi' ? 'Xem bảng giá' : 'See pricing'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-ink-50 border-y border-ink-100">
        <div className="container-app grid sm:grid-cols-3 gap-6">
          <ValueProp icon={Globe2}
            title={lang === 'vi' ? 'Hoàn toàn song ngữ' : 'Fully bilingual'}
            sub={lang === 'vi' ? 'Mọi dòng đều có tiếng Việt và tiếng Anh.' : 'Every line in Vietnamese and English.'} />
          <ValueProp icon={Smartphone}
            title={lang === 'vi' ? 'Mobile-first' : 'Mobile-first'}
            sub={lang === 'vi' ? 'Dùng được mọi lúc — ở tiệm hay ở nhà.' : 'Use it anywhere — at the shop or at home.'} />
          <ValueProp icon={Shield}
            title={lang === 'vi' ? 'Riêng tư & bảo mật' : 'Private & secure'}
            sub={lang === 'vi' ? 'Dữ liệu của bạn — chỉ bạn xem được.' : 'Your data — only you can see it.'} />
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white px-6 sm:px-12 py-14 text-center">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-3xl sm:text-4xl font-extrabold">{t.waitlist.title}</h3>
              <p className="mt-3 text-ink-300 max-w-xl mx-auto">{t.waitlist.sub}</p>
              <form onSubmit={handleWaitlist} className="mt-7 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.waitlist.placeholder}
                  className="input flex-1 !bg-white/10 !border-white/15 !text-white placeholder:!text-white/50 focus:!border-white/40 focus:!ring-white/10"
                  required
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  {t.waitlist.submit} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {submitted && <p className="mt-3 text-sm text-brand-300">{t.waitlist.success}</p>}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, sub, bullets, badge, tone = 'brand' }) {
  const toneStyles = {
    brand: 'bg-brand-50 text-brand-700',
    ink: 'bg-ink-100 text-ink-700',
    gold: 'bg-gold-500/10 text-gold-600',
  }[tone]
  return (
    <div className="card p-6 flex flex-col gap-4 hover:shadow-glow transition">
      <div className={'w-11 h-11 rounded-xl flex items-center justify-center ' + toneStyles}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-ink-900">{title}</h3>
          {badge && <span className="badge bg-gold-500/10 text-gold-600">{badge}</span>}
        </div>
        <p className="mt-1.5 text-sm text-ink-500">{sub}</p>
      </div>
      <ul className="mt-auto space-y-1.5 text-sm text-ink-600">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" /> {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ValueProp({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-brand-600 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{sub}</p>
      </div>
    </div>
  )
}

function HeroMock() {
  const { lang } = useLang()
  const rows = [
    { name: lang === 'vi' ? 'Vật tư nail' : 'Nail supply', cat: 'supply', amount: 248.4 },
    { name: lang === 'vi' ? 'Tiền điện' : 'Electric bill', cat: 'utilities', amount: 312.5 },
    { name: lang === 'vi' ? 'Tiền thuê' : 'Rent', cat: 'rent', amount: 2400 },
  ]
  return (
    <div className="card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
            {lang === 'vi' ? 'Tổng quan tiệm' : 'Shop overview'}
          </p>
          <p className="text-lg font-bold text-ink-900">
            {lang === 'vi' ? 'Tháng này' : 'This month'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge bg-brand-50 text-brand-700"><Wallet className="w-3 h-3" /> $12,840</span>
          <span className="badge bg-rose-50 text-rose-700"><Receipt className="w-3 h-3" /> -$5,217</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-ink-50 rounded-xl py-3">
          <p className="text-xs text-ink-500">{lang === 'vi' ? 'Thu nhập' : 'Income'}</p>
          <p className="font-bold text-ink-900">$12,840</p>
        </div>
        <div className="bg-ink-50 rounded-xl py-3">
          <p className="text-xs text-ink-500">{lang === 'vi' ? 'Chi phí' : 'Expenses'}</p>
          <p className="font-bold text-ink-900">$5,217</p>
        </div>
        <div className="bg-brand-50 rounded-xl py-3">
          <p className="text-xs text-brand-700">{lang === 'vi' ? 'Lợi nhuận' : 'Net'}</p>
          <p className="font-bold text-brand-700">$7,623</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
          {lang === 'vi' ? 'Chi phí gần đây' : 'Recent expenses'}
        </p>
        <ul className="divide-y divide-ink-100">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center justify-between py-2.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-600">
                  <Receipt className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.cat}</p>
                </div>
              </div>
              <span className="font-semibold text-ink-900">-${r.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs bg-gold-500/10 text-gold-700 rounded-xl px-3 py-2">
        <Bell className="w-4 h-4 flex-shrink-0" />
        <span>
          {lang === 'vi'
            ? 'AI thấy chi phí vật tư tăng 18% so với tháng trước.'
            : 'AI noticed supply costs are up 18% vs last month.'}
        </span>
      </div>
    </div>
  )
}
