import Logo from './Logo.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-app py-10 grid md:grid-cols-3 gap-6 items-start">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-500 max-w-xs">{t.footer.tagline}</p>
        </div>
        <div className="text-sm text-ink-500">
          <p className="font-semibold text-ink-700 mb-2">Contact</p>
          <p>hello@txpick.com</p>
          <p>txpick.com</p>
        </div>
        <div className="text-sm text-ink-500 md:text-right">
          <p>© {year} TxPick. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
