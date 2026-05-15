import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  FileText,
  LogOut,
  Receipt,
  Crown,
  WalletCards,
  BriefcaseBusiness,
  Settings,
} from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const navItems = [
  { to: '/today', icon: CalendarDays, en: 'Today', vi: 'Hôm nay' },
  { to: '/reminders', icon: Bell, en: 'Reminders', vi: 'Nhắc việc' },
  { to: '/expenses', icon: Receipt, en: 'Expenses', vi: 'Chi tiêu' },
  { to: '/bills', icon: WalletCards, en: 'Bills', vi: 'Hóa đơn' },
  { to: '/summary', icon: FileText, en: 'Summary', vi: 'Tổng kết' },
  { to: '/tax', icon: BriefcaseBusiness, en: 'Year-end', vi: 'Cuối năm' },
  { to: '/pricing', icon: Crown, en: 'Upgrade', vi: 'Nâng cấp' },
  { to: '/settings', icon: Settings, en: 'Settings', vi: 'Cài đặt' },
]

// Mobile bottom bar: only the 5 pages used daily. Upgrade + Settings live in the header.
const mobileNav = [
  { to: '/today', icon: CalendarDays, en: 'Today', vi: 'Hôm nay' },
  { to: '/reminders', icon: Bell, en: 'Tasks', vi: 'Nhắc việc' },
  { to: '/expenses', icon: Receipt, en: 'Expenses', vi: 'Chi tiêu' },
  { to: '/bills', icon: WalletCards, en: 'Bills', vi: 'Hóa đơn' },
  { to: '/summary', icon: FileText, en: 'Review', vi: 'Tổng kết' },
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const logoutLabel = lang === 'vi' ? 'Đăng xuất' : 'Log out'
  const settingsLabel = lang === 'vi' ? 'Cài đặt' : 'Settings'
  const upgradeLabel = lang === 'vi' ? 'Nâng cấp' : 'Upgrade'

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
            <LanguageToggle />
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `lg:hidden inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-2 text-xs font-extrabold text-gold-700 shadow-sm transition hover:bg-gold-100 ${isActive ? 'ring-2 ring-gold-200' : ''}`
              }
              title={upgradeLabel}
              aria-label={upgradeLabel}
            >
              <Crown className="w-4 h-4" />
              <span>{upgradeLabel}</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `lg:hidden btn-ghost !px-2 !py-2 ${isActive ? 'text-brand-700 bg-brand-50' : ''}`
              }
              title={settingsLabel}
              aria-label={settingsLabel}
            >
              <Settings className="w-4 h-4" />
            </NavLink>
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate ml-1">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title={logoutLabel} aria-label={logoutLabel}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-10">
        <Outlet />
      </main>

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
                  <span className="leading-none truncate max-w-[72px]">{lang === 'vi' ? item.vi : item.en}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
