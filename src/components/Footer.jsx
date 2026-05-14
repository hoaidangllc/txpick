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
          <a href="mailto:hello@txpick.com" className="hover:text-ink-900">hello@txpick.com</a>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/pricing" className="hover:text-ink-900">{t.nav.pricing}</Link>
            <a href="#" className="hover:text-ink-900">{t.footer.privacy}</a>
            <a href="#" className="hover:text-ink-900">{t.footer.terms}</a>
          </p>
        </div>
        <div className="text-sm text-ink-500 md:text-right">
          <p>&copy; {year} TxPick. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
