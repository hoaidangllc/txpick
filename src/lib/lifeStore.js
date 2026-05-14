export const STORAGE_KEYS = {
  reminders: 'txpick_life_reminders',
  expenses: 'txpick_life_expenses',
  bills: 'txpick_life_bills',
  plan: 'txpick_life_plan',
  aiUsage: 'txpick_life_ai_usage',
  dailySummary: 'txpick_life_daily_summary',
}

export const CATEGORIES = [
  { key: 'personal', label: 'Personal', vi: 'Cá nhân' },
  { key: 'business', label: 'Business', vi: 'Business' },
  { key: 'family', label: 'Family', vi: 'Gia đình' },
  { key: 'bill', label: 'Bill', vi: 'Bill' },
  { key: 'health', label: 'Health', vi: 'Sức khỏe' },
  { key: 'work', label: 'Work', vi: 'Công việc' },
  { key: 'other', label: 'Other', vi: 'Khác' },
]

export const EXPENSE_CATEGORIES = [
  { key: 'personal', label: 'Personal', vi: 'Cá nhân' },
  { key: 'business', label: 'Business', vi: 'Business' },
  { key: 'salon', label: 'Salon', vi: 'Tiệm nail' },
  { key: 'bill', label: 'Bill', vi: 'Bill' },
  { key: 'food', label: 'Food', vi: 'Ăn uống' },
  { key: 'supply', label: 'Supplies', vi: 'Vật tư' },
  { key: 'gas', label: 'Gas', vi: 'Xăng xe' },
  { key: 'other', label: 'Other', vi: 'Khác' },
]

export const PLANS = {
  free: { name: 'Free', reminderLimit: 20, expenseLimit: 40, aiDailyLimit: 3, ads: true },
  basic: { name: 'Pro $1.99', reminderLimit: 50, expenseLimit: 120, aiDailyLimit: 8, ads: false },
  premium: { name: 'Pro $4.99', reminderLimit: Infinity, expenseLimit: Infinity, aiDailyLimit: 20, ads: false },
}

export function fmtUSD(value) {
  return (Number(value) || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function monthKey(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function isSameDay(iso, ref = new Date()) {
  if (!iso) return false
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

export function isCurrentMonth(iso) {
  if (!iso) return false
  return monthKey(iso) === monthKey()
}

export function getPlan(planKey) {
  return PLANS[planKey] || PLANS.free
}

export function getUsageKey() {
  return `txpick_life_ai_usage_${todayISO()}`
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function canUseAI(planKey) {
  const plan = getPlan(planKey)
  const usage = readJSON(getUsageKey(), { count: 0 })
  return { allowed: usage.count < plan.aiDailyLimit, used: usage.count, limit: plan.aiDailyLimit }
}

export function bumpAIUsage() {
  const key = getUsageKey()
  const usage = readJSON(key, { count: 0 })
  const next = { count: Number(usage.count || 0) + 1, date: todayISO() }
  writeJSON(key, next)
  return next
}

export function parseNaturalReminder(text) {
  const raw = String(text || '').trim()
  const lower = raw.toLowerCase()
  const repeat = /mỗi ngày|hằng ngày|hang ngay|daily|every day/.test(lower)
    ? 'daily'
    : /mỗi tuần|hằng tuần|weekly|every week/.test(lower)
      ? 'weekly'
      : /mỗi tháng|hằng tháng|monthly|every month/.test(lower)
        ? 'monthly'
        : 'none'
  const category = /bill|điện|dien|nước|nuoc|gas|internet|rent|mortgage|credit/.test(lower)
    ? 'bill'
    : /tiệm|tiem|salon|business|supply|thợ|tho/.test(lower)
      ? 'business'
      : /thuốc|thuoc|doctor|bác sĩ|bac si|health/.test(lower)
        ? 'health'
        : /vợ|vo|con|family|mom|dad|mẹ|ba/.test(lower)
          ? 'family'
          : /work|việc|viec|meeting|email/.test(lower)
            ? 'work'
            : 'personal'

  let date = todayISO()
  const d = new Date()
  if (/mai|tomorrow/.test(lower)) {
    d.setDate(d.getDate() + 1)
    date = d.toISOString().slice(0, 10)
  }

  let time = ''
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|sáng|sang|chiều|chieu|tối|toi)?/) 
  if (timeMatch) {
    let h = Number(timeMatch[1])
    const m = Number(timeMatch[2] || 0)
    const p = timeMatch[3] || ''
    if ((p === 'pm' || /chi|toi|tối/.test(p)) && h < 12) h += 12
    if ((p === 'am' || /sáng|sang/.test(p)) && h === 12) h = 0
    time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  } else if (/sáng|sang|morning/.test(lower)) time = '09:00'
  else if (/trưa|trua|noon/.test(lower)) time = '12:00'
  else if (/chiều|chieu|afternoon/.test(lower)) time = '15:00'
  else if (/tối|toi|night|evening/.test(lower)) time = '20:00'

  const title = raw
    .replace(/^\s*(nhắc|nhac|remind)(\s+tôi|\s+mình|\s+me)?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim() || 'New reminder'

  return { title, category, repeat, date, time }
}

export function buildDailyInsight({ reminders, expenses, bills }) {
  const todayReminders = reminders.filter((r) => !r.done && isSameDay(r.date))
  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.date))
  const business = monthExpenses.filter((e) => ['business', 'salon', 'supply'].includes(e.category)).reduce((s, e) => s + Number(e.amount || 0), 0)
  const personal = monthExpenses.filter((e) => e.category === 'personal' || e.category === 'food' || e.category === 'gas').reduce((s, e) => s + Number(e.amount || 0), 0)
  const dueSoon = bills.filter((b) => {
    const today = new Date().getDate()
    const due = Number(b.dueDay || 1)
    const diff = (due - today + 31) % 31
    return diff <= 5
  })
  const tips = []
  if (todayReminders.length) tips.push(`Hôm nay có ${todayReminders.length} reminder cần xử lý.`)
  else tips.push('Hôm nay chưa có reminder nào — mở app là thấy nhẹ người rồi đó.')
  if (dueSoon.length) tips.push(`${dueSoon.length} bill sắp tới hạn trong 5 ngày.`)
  if (business > 0) tips.push(`Business expense tháng này: ${fmtUSD(business)}.`)
  if (personal > 0) tips.push(`Personal expense tháng này: ${fmtUSD(personal)}.`)
  if (!monthExpenses.length) tips.push('Bạn chưa nhập chi tiêu tháng này. Nhập mỗi ngày một chút, cuối năm đỡ cực.')
  return tips.join(' ')
}
