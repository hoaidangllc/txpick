import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from '../data/translations.js'

const LanguageContext = createContext({ lang: 'vi', setLang: () => {}, t: translations.vi })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('txpick_lang')
      if (saved === 'en' || saved === 'vi') return saved
    } catch {}
    return 'vi'
  })

  const setLang = useCallback((next) => {
    const safe = next === 'en' ? 'en' : 'vi'
    setLangState(safe)
    try { localStorage.setItem('txpick_lang', safe) } catch {}
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang] ?? translations.vi

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
