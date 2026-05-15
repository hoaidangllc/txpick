import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  FileText,
  LogOut,
  Receipt,
  Sparkles,
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
  { to: '/summary', icon: FileText, en: 'Insights', vi: 'Tổng kết' },
  { to: '/tax', icon: BriefcaseBusiness, en: 'Tax', vi: 'Thuế' },
  { to: '/smart', icon: Sparkles, en: 'Smart', vi: 'Gợi ý' },
  { to: '/settings', icon: Settings, en: 'Settings', vi: 'Cài đặt' },
]

// Mobile must stay one clean row. Keep only daily-use pages here.
const mobileNav = [
  { to: '/today', icon: CalendarDays, en: 'Today', vi: 'Hôm nay' },
  { to: '/bills', icon: WalletCards, en: 'Bills', vi: 'Hóa đơn' },
  { to: '/expenses', icon: Receipt, en: 'Expenses', vi: 'Chi tiêu' },
  { to: '/tax', icon: BriefcaseBusiness, en: 'Tax', vi: 'Thuế' },
  { to: '/smart', icon: Sparkles, en: 'Smart', vi: 'Smart' },
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

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
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
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title={logoutLabel} aria-label={logoutLabel}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-10">
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
                  <span className={`w-9 h-7 rounded-full flex items-center justify-center transition ${isActive ? 'bg-brand-50' : ''}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="leading-none truncate max-w-[64px]">{lang === 'vi' ? item.vi : item.en}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
