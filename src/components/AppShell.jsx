import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Briefcase, User, FileText, Sparkles, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const navItems = [
  { to: '/business', icon: Briefcase, key: 'business' },
  { to: '/personal', icon: User, key: 'personal' },
  { to: '/tax', icon: FileText, key: 'tax' },
  { to: '/ai', icon: Sparkles, key: 'ai' },
]

export default function AppShell() {
  const { t } = useLang()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {t.nav[item.key]}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate">
              {user?.email}
            </span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title={t.nav.logout}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs font-semibold ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {t.nav[item.key]}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 pb-24 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
