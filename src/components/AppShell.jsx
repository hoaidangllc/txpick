import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, FileText, LogOut, Receipt, Sparkles, WalletCards } from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { textFor } from '../lib/uiText.js'

const navItems = [
  { to: '/today', icon: CalendarDays, key: 'today' },
  { to: '/reminders', icon: Bell, key: 'reminders' },
  { to: '/expenses', icon: Receipt, key: 'expenses' },
  { to: '/bills', icon: WalletCards, key: 'bills' },
  { to: '/summary', icon: FileText, key: 'summary' },
  { to: '/smart', icon: Sparkles, key: 'smart' },
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { lang } = useLang()
  const ui = textFor(lang)
  const navigate = useNavigate()
  const handleLogout = async () => { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'}`}><item.icon className="w-4 h-4" />{ui.nav[item.key]}</NavLink>)}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="hidden sm:block text-xs text-ink-500 max-w-[160px] truncate">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost !px-2 !py-2" title="Log out"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100">
        <div className="grid grid-cols-6">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${isActive ? 'text-brand-700' : 'text-ink-500'}`}><item.icon className="w-5 h-5" />{ui.nav[item.key]}</NavLink>)}
        </div>
      </nav>
      <main className="flex-1 pb-24 lg:pb-10"><Outlet /></main>
    </div>
  )
}
