
export const CATEGORIES = [
  { key: 'personal', label: 'Personal', vi: 'Cá nhân' },
  { key: 'business', label: 'Business', vi: 'Kinh doanh' },
  { key: 'family', label: 'Family', vi: 'Gia đình' },
  { key: 'bill', label: 'Bill', vi: 'Hóa đơn' },
  { key: 'health', label: 'Health', vi: 'Sức khỏe' },
  { key: 'work', label: 'Work', vi: 'Công việc' },
  { key: 'other', label: 'Other', vi: 'Khác' },
]

export const EXPENSE_CATEGORIES = [
  { key: 'personal', label: 'Personal', vi: 'Cá nhân' },
  { key: 'business', label: 'Business', vi: 'Kinh doanh' },
  { key: 'salon', label: 'Salon', vi: 'Tiệm nail' },
  { key: 'bill', label: 'Bill', vi: 'Hóa đơn' },
  { key: 'food', label: 'Food', vi: 'Ăn uống' },
  { key: 'supply', label: 'Supplies', vi: 'Vật tư' },
  { key: 'gas', label: 'Gas', vi: 'Xăng xe' },
  { key: 'other', label: 'Other', vi: 'Khác' },
]

export const REPEAT_LABELS = {
  none: { en: 'One time', vi: 'Một lần' },
  daily: { en: 'Daily', vi: 'Hằng ngày' },
  weekly: { en: 'Weekly', vi: 'Hằng tuần' },
  monthly: { en: 'Monthly', vi: 'Hằng tháng' },
}

export const PLANS = {
  free: { name: 'Free', viName: 'Miễn phí', reminderLimit: 20, expenseLimit: 40, aiDailyLimit: 3, ads: true },
  basic: { name: 'Pro Basic', viName: 'Pro Cơ Bản', reminderLimit: 50, expenseLimit: 120, aiDailyLimit: 8, ads: false },
  premium: { name: 'Pro Plus', viName: 'Pro Plus', reminderLimit: Infinity, expenseLimit: Infinity, aiDailyLimit: 20, ads: false },
}

export function categoryLabel(key, lang = 'vi', list = CATEGORIES) {
  const item = list.find((x) => x.key === key)
  if (!item) return key || ''
  return lang === 'vi' ? item.vi : item.label
}

export function repeatLabel(key, lang = 'vi') {
  return REPEAT_LABELS[key]?.[lang] || key || ''
}

export function planLabel(planKey, lang = 'vi') {
  const plan = getPlan(planKey)
  return lang === 'vi' ? plan.viName : plan.name
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


export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
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

export function buildDailyInsight({ reminders, expenses, bills, lang = 'vi' }) {
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

  if (lang === 'en') {
    const tips = []
    if (todayReminders.length) tips.push(`You have ${todayReminders.length} reminder${todayReminders.length > 1 ? 's' : ''} today.`)
    else tips.push('No reminders due today.')
    if (dueSoon.length) tips.push(`${dueSoon.length} bill${dueSoon.length > 1 ? 's are' : ' is'} due soon.`)
    if (business > 0) tips.push(`Business expenses this month: ${fmtUSD(business)}.`)
    if (personal > 0) tips.push(`Personal expenses this month: ${fmtUSD(personal)}.`)
    if (!monthExpenses.length) tips.push('You have not added expenses this month yet.')
    return tips.join(' ')
  }

  const tips = []
  if (todayReminders.length) tips.push(`Hôm nay bạn có ${todayReminders.length} việc cần nhớ.`)
  else tips.push('Hôm nay chưa có việc đến hạn.')
  if (dueSoon.length) tips.push(`${dueSoon.length} hóa đơn sắp tới hạn trong vài ngày tới.`)
  if (business > 0) tips.push(`Chi tiêu kinh doanh tháng này: ${fmtUSD(business)}.`)
  if (personal > 0) tips.push(`Chi tiêu cá nhân tháng này: ${fmtUSD(personal)}.`)
  if (!monthExpenses.length) tips.push('Bạn chưa nhập chi tiêu tháng này. Nhập đều mỗi ngày sẽ dễ tổng kết cuối năm hơn.')
  return tips.join(' ')
}
