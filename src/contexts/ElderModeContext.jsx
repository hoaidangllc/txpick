import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ElderModeContext = createContext({ elder: false, setElder: () => {} })

export function ElderModeProvider({ children }) {
  const [elder, setElderState] = useState(() => {
    try {
      const saved = localStorage.getItem('txpick_elder_mode')
      return saved === '1'
    } catch { return false }
  })

  const setElder = useCallback((v) => {
    setElderState(v)
    try { localStorage.setItem('txpick_elder_mode', v ? '1' : '0') } catch {}
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('elder-mode', elder)
  }, [elder])

  return (
    <ElderModeContext.Provider value={{ elder, setElder, toggle: () => setElder(!elder) }}>
      {children}
    </ElderModeContext.Provider>
  )
}

export function useElderMode() {
  return useContext(ElderModeContext)
}
