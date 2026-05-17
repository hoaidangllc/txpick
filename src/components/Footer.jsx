import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-app py-10 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-500 max-w-xs">{t.footer.tagline}</p>
        </div>
        <div className="text-sm text-ink-500">
          <p className="font-semibold text-ink-700 mb-2">{t.footer.contact}</p>
          <a href="mailto:hello@txpick.app" className="hover:text-ink-900">hello@txpick.app</a>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <a href="/what-is-txpick.html" className="hover:text-ink-900">TXPick</a>
            <a href="/how-it-works.html" className="hover:text-ink-900">Guide</a>
            <Link to="/feedback" className="hover:text-ink-900">{t.nav.feedback}</Link>
            <Link to="/privacy" className="hover:text-ink-900">{t.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-ink-900">{t.footer.terms}</Link>
          </p>
        </div>
        <div className="text-sm text-ink-500 md:text-right">
          <p>&copy; {year} TXPick. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
