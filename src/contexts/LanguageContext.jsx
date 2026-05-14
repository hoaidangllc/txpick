import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from '../data/translations.js'

const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: translations.en })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('txpick_lang')
      if (saved === 'en' || saved === 'vi') return saved
    } catch {}
    // Default to Vietnamese if browser locale starts with vi
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi')) return 'vi'
    return 'en'
  })

  const setLang = useCallback((next) => {
    setLangState(next)
    try { localStorage.setItem('txpick_lang', next) } catch {}
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang] ?? translations.en

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
