import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, FileText, LogOut, Receipt, Sparkles, WalletCards } from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const navItems = [
  { to: '/today',     icon: CalendarDays, en: 'Today',     vi: 'Hôm nay' },
  { to: '/reminders', icon: Bell,         en: 'Reminders', vi: 'Nhắc việc' },
  { to: '/expenses',  icon: Receipt,      en: 'Expenses',  vi: 'Chi tiêu' },
  { to: '/bills',     icon: WalletCards,  en: 'Bills',     vi: 'Hóa đơn' },
  { to: '/summary',   icon: FileText,     en: 'Summary',   vi: 'Tổng kết' },
  { to: '/smart',     icon: Sparkles,     en: 'Smart',     vi: 'Gợi ý' },
]

const mobileNav = navItems.filter((n) => n.to !== '/smart')

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const handleLogout = async () => { await signOut(); navigate('/') }
  const logoutLabel = lang === 'vi' ? 'Đăng xuất' : 'Log out'

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
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title={logoutLabel} aria-label={logoutLabel}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ink-100">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-9 h-7 rounded-full flex items-center justify-center transition ${isActive ? 'bg-brand-50' : ''}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  {lang === 'vi' ? item.vi : item.en}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 pb-24 lg:pb-10"><Outlet /></main>
    </div>
  )
}
