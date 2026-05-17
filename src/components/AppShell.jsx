import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  FileText,
  LogOut,
  Receipt,
  MessageSquareHeart,
  WalletCards,
  BriefcaseBusiness,
  Settings,
  UserRound,
  Plus,
} from 'lucide-react'
import Modal from './Modal.jsx'
import Logo from './Logo.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { FEATURES } from '../config/features.js'
import { isAdminEmail } from '../config/admin.js'

const personalNav = [
  { to: '/today', icon: CalendarDays, en: 'Today', vi: 'Hôm nay' },
  { to: '/reminders', icon: Bell, en: 'Reminders', vi: 'Nhắc việc' },
  { to: '/expenses', icon: Receipt, en: 'Expenses', vi: 'Chi tiêu' },
  { to: '/bills', icon: WalletCards, en: 'Bills', vi: 'Hóa đơn' },
  { to: '/summary', icon: FileText, en: 'Summary', vi: 'Tổng kết' },
]

const businessNav = [
  { to: '/business', icon: BriefcaseBusiness, en: 'Business', vi: 'Business' },
  { to: '/tax', icon: FileText, en: '1099 / W-2', vi: '1099 / W-2' },
  { to: '/reminders', icon: Bell, en: 'Reminders', vi: 'Nhắc việc' },
  { to: '/summary', icon: Receipt, en: 'Reports', vi: 'Tổng kết' },
]

const feedbackNav = { to: '/feedback', icon: MessageSquareHeart, en: 'Feedback', vi: 'Góp ý' }
const adminFeedbackNav = { to: '/admin/feedback', icon: MessageSquareHeart, en: 'Admin Feedback', vi: 'Góp ý admin' }
const settingsNav = { to: '/settings', icon: Settings, en: 'Settings', vi: 'Cài đặt' }
const premiumNav = { to: '/pricing', icon: MessageSquareHeart, en: 'Upgrade', vi: 'Nâng cấp' }

export default function AppShell() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isBusiness = profile?.type === 'business'
  const extraNav = [FEATURES.premium ? premiumNav : feedbackNav, ...(isAdminEmail(user?.email) ? [adminFeedbackNav] : []), settingsNav]
  const navItems = [...(isBusiness ? businessNav : personalNav), ...extraNav]
  const mobileNav = isBusiness
    ? [businessNav[0], businessNav[1], businessNav[2], feedbackNav, settingsNav]
    : [personalNav[0], personalNav[1], personalNav[2], personalNav[3], feedbackNav]

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const logoutLabel = lang === 'vi' ? 'Đăng xuất' : 'Log out'
  const workspaceLabel = isBusiness ? (lang === 'vi' ? 'Business' : 'Business') : (lang === 'vi' ? 'Cá nhân' : 'Personal')
  const switchLabel = isBusiness ? (lang === 'vi' ? 'Qua Cá nhân' : 'Switch to Personal') : (lang === 'vi' ? 'Qua Business' : 'Switch to Business')
  const switchTarget = isBusiness ? 'personal' : 'business'
  const feedbackLabel = lang === 'vi' ? 'Góp ý' : 'Feedback'
  const [quickOpen, setQuickOpen] = useState(false)
  const quick = lang === 'vi' ? {
    title: 'Thêm nhanh', reminder: 'Nhắc việc', expense: 'Chi tiêu', bill: 'Hóa đơn', business: 'Business / Tax', close: 'Đóng', sub: 'Chọn việc cần thêm. TXPick ưu tiên thao tác nhanh trên điện thoại.'
  } : {
    title: 'Quick add', reminder: 'Reminder', expense: 'Expense', bill: 'Bill', business: 'Business / Tax', close: 'Close', sub: 'Choose what you want to add. TXPick is optimized for fast mobile entry.'
  }

  const switchWorkspace = async () => {
    await updateProfile?.({ type: switchTarget })
    navigate(switchTarget === 'business' ? '/business' : '/today')
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {lang === 'vi' ? item.vi : item.en}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={switchWorkspace}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 hover:bg-brand-50 hover:text-brand-700 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-bold text-ink-600 transition"
              title={switchLabel}
              aria-label={switchLabel}
            >
              {isBusiness ? <BriefcaseBusiness className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{workspaceLabel}</span>
              <span className="sm:hidden">{isBusiness ? 'Biz' : (lang === 'vi' ? 'Cá nhân' : 'Me')}</span>
            </button>
            <LanguageToggle />
            <NavLink
              to="/feedback"
              className={({ isActive }) =>
                `lg:hidden inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-2 text-xs font-extrabold text-brand-700 shadow-sm transition hover:bg-brand-100 ${isActive ? 'ring-2 ring-brand-200' : ''}`
              }
              title={feedbackLabel}
              aria-label={feedbackLabel}
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Góp ý' : 'Feedback'}</span>
            </NavLink>
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate ml-1">{profile?.display_name || user?.user_metadata?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title={logoutLabel} aria-label={logoutLabel}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-10">
        <Outlet />
      </main>

      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="mb-3 w-14 h-14 rounded-full bg-brand-600 text-white shadow-soft flex items-center justify-center active:scale-95 transition"
          aria-label={quick.title}
          title={quick.title}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <div className="lg:hidden fixed bottom-16 right-3 z-30">
        <button
          type="button"
          onClick={switchWorkspace}
          className="rounded-full bg-ink-900 text-white shadow-soft px-3 py-2 text-xs font-extrabold flex items-center gap-1.5"
        >
          {isBusiness ? <UserRound className="w-4 h-4" /> : <BriefcaseBusiness className="w-4 h-4" />}
          {switchLabel}
        </button>
      </div>

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title={quick.title} footer={<button className="btn-secondary" onClick={() => setQuickOpen(false)}>{quick.close}</button>}>
        <p className="text-sm text-ink-500 mb-4">{quick.sub}</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary justify-start" onClick={() => { setQuickOpen(false); navigate('/reminders') }}><Bell className="w-4 h-4" /> {quick.reminder}</button>
          <button className="btn-secondary justify-start" onClick={() => { setQuickOpen(false); navigate('/expenses') }}><Receipt className="w-4 h-4" /> {quick.expense}</button>
          <button className="btn-secondary justify-start" onClick={() => { setQuickOpen(false); navigate('/bills') }}><WalletCards className="w-4 h-4" /> {quick.bill}</button>
          <button className="btn-secondary justify-start" onClick={() => { setQuickOpen(false); navigate('/tax') }}><BriefcaseBusiness className="w-4 h-4" /> {quick.business}</button>
        </div>
      </Modal>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ink-100 safe-bottom">
        <div className="grid grid-cols-5 max-w-xl mx-auto">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold transition ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-10 h-7 rounded-full flex items-center justify-center transition ${isActive ? 'bg-brand-50' : ''}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="leading-none truncate max-w-[76px]">{lang === 'vi' ? item.vi : item.en}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
