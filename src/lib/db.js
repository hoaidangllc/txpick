import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, SUPABASE_CONFIGURED } from './supabase.js'

function requireUserId(userId) {
  if (!userId) throw new Error('Missing user session. Please sign in again.')
}

export function toISODate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return new Date(value).toISOString().slice(0, 10)
}

export function toLocalTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function buildDueAt(date, time = '') {
  if (!date) return null
  const safeTime = time || '09:00'
  const d = new Date(`${date}T${safeTime}:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function buildDueDateFromDay(dueDay) {
  const now = new Date()
  const day = Math.min(Math.max(Number(dueDay || 1), 1), 31)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const d = new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDay))
  return toISODate(d)
}

export function normalizeReminder(row) {
  return {
    ...row,
    date: toISODate(row.due_at),
    time: toLocalTime(row.due_at),
    repeat: row.repeat_pattern || 'none',
    done: Boolean(row.completed),
    doneAt: row.completed_at,
    notes: row.notes || '',
  }
}

export function normalizeExpense(row) {
  return {
    ...row,
    date: toISODate(row.expense_date),
    note: row.notes || '',
  }
}

export function normalizeBill(row) {
  const dueDate = toISODate(row.due_date)
  const dueDay = dueDate ? new Date(`${dueDate}T00:00:00`).getDate() : 1
  return {
    ...row,
    name: row.title,
    dueDay,
    dueDate,
  }
}

async function selectForUser(table, userId, orderColumn = 'created_at', ascending = false) {
  requireUserId(userId)
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('profile_id', userId)
    .order(orderColumn, { ascending })
  if (error) throw error
  return data || []
}

export const remindersDb = {
  async list(userId) {
    const rows = await selectForUser('reminders', userId, 'due_at', true)
    return rows.map(normalizeReminder)
  },
  async add(userId, item) {
    requireUserId(userId)
    const payload = {
      profile_id: userId,
      title: item.title,
      notes: item.notes || '',
      category: item.category || 'personal',
      for_person: item.for_person || item.forPerson || 'me',
      due_at: buildDueAt(item.date, item.time),
      repeat_pattern: item.repeat || item.repeat_pattern || 'none',
      completed: Boolean(item.done || item.completed),
      completed_at: item.doneAt || item.completed_at || null,
      ai_generated: Boolean(item.ai_generated),
    }
    const { data, error } = await supabase.from('reminders').insert(payload).select('*').single()
    if (error) throw error
    return normalizeReminder(data)
  },
  async update(userId, id, patch) {
    requireUserId(userId)
    const payload = {}
    if ('title' in patch) payload.title = patch.title
    if ('notes' in patch) payload.notes = patch.notes || ''
    if ('category' in patch) payload.category = patch.category || 'personal'
    if ('for_person' in patch || 'forPerson' in patch) payload.for_person = patch.for_person || patch.forPerson || 'me'
    if ('repeat' in patch || 'repeat_pattern' in patch) payload.repeat_pattern = patch.repeat || patch.repeat_pattern || 'none'
    if ('done' in patch || 'completed' in patch) payload.completed = Boolean(patch.done ?? patch.completed)
    if ('doneAt' in patch || 'completed_at' in patch) payload.completed_at = patch.doneAt || patch.completed_at || null
    if ('date' in patch || 'time' in patch) {
      payload.due_at = buildDueAt(patch.date, patch.time)
    }
    const { data, error } = await supabase
      .from('reminders')
      .update(payload)
      .eq('id', id)
      .eq('profile_id', userId)
      .select('*')
      .single()
    if (error) throw error
    return normalizeReminder(data)
  },
  async remove(userId, id) {
    requireUserId(userId)
    const { error } = await supabase.from('reminders').delete().eq('id', id).eq('profile_id', userId)
    if (error) throw error
    return id
  },
}

export const expensesDb = {
  async list(userId) {
    const rows = await selectForUser('expenses', userId, 'expense_date', false)
    return rows.map(normalizeExpense)
  },
  async add(userId, item) {
    requireUserId(userId)
    const payload = {
      profile_id: userId,
      title: item.title,
      amount: Number(item.amount || 0),
      category: item.category || 'personal',
      expense_type: item.expense_type || item.expenseType || item.category || 'personal',
      recurring: Boolean(item.recurring),
      recurring_pattern: item.recurring_pattern || item.recurringPattern || 'none',
      tax_category: item.tax_category || item.taxCategory || null,
      expense_date: item.date || item.expense_date || new Date().toISOString().slice(0, 10),
      notes: item.note || item.notes || '',
    }
    const { data, error } = await supabase.from('expenses').insert(payload).select('*').single()
    if (error) throw error
    return normalizeExpense(data)
  },
  async remove(userId, id) {
    requireUserId(userId)
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('profile_id', userId)
    if (error) throw error
    return id
  },
}

export const billsDb = {
  async list(userId) {
    const rows = await selectForUser('bills', userId, 'due_date', true)
    return rows.map(normalizeBill)
  },
  async add(userId, item) {
    requireUserId(userId)
    const payload = {
      profile_id: userId,
      title: item.title || item.name,
      amount: Number(item.amount || 0),
      category: item.category || 'bill',
      due_date: item.due_date || item.dueDate || buildDueDateFromDay(item.dueDay),
      auto_reminder: item.auto_reminder ?? true,
      paid: Boolean(item.paid),
      paid_at: item.paid_at || null,
    }
    const { data, error } = await supabase.from('bills').insert(payload).select('*').single()
    if (error) throw error
    return normalizeBill(data)
  },
  async update(userId, id, patch) {
    requireUserId(userId)
    const payload = {}
    if ('paid' in patch) payload.paid = Boolean(patch.paid)
    if ('paid_at' in patch) payload.paid_at = patch.paid_at
    if ('paidAt' in patch) payload.paid_at = patch.paidAt
    const { data, error } = await supabase
      .from('bills')
      .update(payload)
      .eq('id', id)
      .eq('profile_id', userId)
      .select('*')
      .single()
    if (error) throw error
    return normalizeBill(data)
  },
  async remove(userId, id) {
    requireUserId(userId)
    const { error } = await supabase.from('bills').delete().eq('id', id).eq('profile_id', userId)
    if (error) throw error
    return id
  },
}

export async function getProfile(userId) {
  requireUserId(userId)
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(user, patch = {}) {
  requireUserId(user?.id)
  const payload = {
    id: user.id,
    email: user.email,
    display_name: patch.display_name || patch.displayName || user.email?.split('@')[0] || '',
    type: patch.type || 'personal',
    business_name: patch.business_name || patch.businessName || null,
    is_pro: Boolean(patch.is_pro ?? patch.isPro ?? false),
    locale: patch.locale || 'vi',
    onboarded_at: patch.onboarded_at || patch.onboardedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single()
  if (error) throw error
  return data
}

export function useRemoteCollection(userId, adapter) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!SUPABASE_CONFIGURED || !userId) {
      setItems([])
      setLoading(false)
      return []
    }
    setLoading(true)
    setError('')
    try {
      const rows = await adapter.list(userId)
      setItems(rows)
      return rows
    } catch (err) {
      setError(err.message || 'Unable to load data')
      return []
    } finally {
      setLoading(false)
    }
  }, [userId, adapter])

  useEffect(() => { reload() }, [reload])

  const api = useMemo(() => ({
    reload,
    add: async (item) => {
      const created = await adapter.add(userId, item)
      setItems((prev) => [created, ...prev])
      return created
    },
    update: async (id, patch) => {
      const updated = await adapter.update(userId, id, patch)
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)))
      return updated
    },
    remove: async (id) => {
      await adapter.remove(userId, id)
      setItems((prev) => prev.filter((x) => x.id !== id))
      return id
    },
  }), [adapter, reload, userId])

  return [items, api, { loading, error, setItems }]
}
