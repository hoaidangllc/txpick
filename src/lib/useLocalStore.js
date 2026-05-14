import { useEffect, useState, useCallback } from 'react'

// Lightweight per-user local persistence. When Supabase is wired up, swap
// these reads/writes for `supabase.from('table').select()` and friends.
// Keeping the API minimal so the upgrade path is mechanical.

export function useLocalStore(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {}
    return typeof initial === 'function' ? initial() : initial
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])

  const add = useCallback((item) => {
    setValue((prev) => [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...item }, ...prev])
  }, [])

  const update = useCallback((id, patch) => {
    setValue((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])

  const remove = useCallback((id) => {
    setValue((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return [value, { setValue, add, update, remove }]
}

export const fmtUSD = (n) =>
  (Number(n) || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export const inCurrentMonth = (iso) => {
  if (!iso) return false
  const d = new Date(iso)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}
