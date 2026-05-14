import { useLang } from '../contexts/LanguageContext.jsx'

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div
      className={`inline-flex items-center bg-ink-100 rounded-full p-1 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === 'en' ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-800'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('vi')}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === 'vi' ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-800'
        }`}
      >
        VI
      </button>
    </div>
  )
}
