// Smart reminder parser & schedule engine for TXPick.
//
// parseReminder(text)  -> { title, category, dueAt, repeat, forPerson }
// nextOccurrence(rem)  -> next Date for a repeating reminder
// groupByStatus(list)  -> { overdue, today, upcoming, done }
//
// Strategy:
//   1. Try a fast regex pass for Vietnamese + English patterns (no API call).
//   2. If user provides an OpenAI key, callers can fall back to aiParseReminder
//      from src/lib/openai.js for messier inputs. Regex stays the baseline
//      so the feature works offline / for free users.

export const CATEGORIES = [
  { key: 'medication',  vi: 'Thuốc',       en: 'Medication',   icon: 'Pill',           color: '#ef4444' },
  { key: 'bill',        vi: 'Hóa đơn',     en: 'Bill',         icon: 'Receipt',        color: '#f59e0b' },
  { key: 'appointment', vi: 'Lịch hẹn',    en: 'Appointment',  icon: 'CalendarCheck',  color: '#0ea5e9' },
  { key: 'family',      vi: 'Gia đình',    en: 'Family',       icon: 'Heart',          color: '#ec4899' },
  { key: 'work',        vi: 'Công việc',   en: 'Work',         icon: 'Briefcase',      color: '#8b5cf6' },
  { key: 'personal',    vi: 'Cá nhân',     en: 'Personal',     icon: 'User',           color: '#10b981' },
  { key: 'other',       vi: 'Khác',        en: 'Other',        icon: 'Bell',           color: '#64748b' },
]

export const REPEAT_PATTERNS = [
  { key: 'none',    vi: 'Một lần',      en: 'Once' },
  { key: 'daily',   vi: 'Hằng ngày',    en: 'Daily' },
  { key: 'weekly',  vi: 'Hằng tuần',    en: 'Weekly' },
  { key: 'monthly', vi: 'Hằng tháng',   en: 'Monthly' },
]

export const FAMILY_ROLES = [
  { key: 'me',      vi: 'Tôi',         en: 'Me' },
  { key: 'mom',     vi: 'Mẹ',          en: 'Mom' },
  { key: 'dad',     vi: 'Ba',          en: 'Dad' },
  { key: 'spouse',  vi: 'Vợ / Chồng',  en: 'Spouse' },
  { key: 'child',   vi: 'Con',         en: 'Child' },
  { key: 'other',   vi: 'Người khác',  en: 'Someone else' },
]

// ---------- main parser ----------
export function parseReminder(input) {
  const text = String(input || '').trim()
  if (!text) return null

  let working = text

  // 1. detect target person ("nhắc mẹ ...", "remind mom ...")
  const forPerson = detectPerson(working)
  if (forPerson.match) working = working.replace(forPerson.match, '').trim()

  // 2. detect repeat pattern
  const repeat = detectRepeat(working)
  if (repeat.match) working = working.replace(repeat.match, '').trim()

  // 3. detect time-of-day
  const tod = detectTime(working)
  if (tod.match) working = working.replace(tod.match, '').trim()

  // 4. detect day reference (ngày mai, thứ X, day-of-month)
  const day = detectDay(working)
  if (day.match) working = working.replace(day.match, '').trim()

  // 5. build dueAt
  const dueAt = buildDueAt({ pattern: repeat.pattern, day, tod })

  // 6. detect category from remaining text
  const category = detectCategory(text)

  // 7. clean up title — strip leading verbs like "nhắc tôi"
  const title = cleanTitle(working) || cleanTitle(text)

  return {
    title,
    category,
    dueAt: dueAt.toISOString(),
    repeat: repeat.pattern,
    repeatDayOfWeek: repeat.pattern === 'weekly' ? (day.dayOfWeek ?? dueAt.getDay()) : null,
    repeatDayOfMonth: repeat.pattern === 'monthly' ? (day.dayOfMonth ?? dueAt.getDate()) : null,
    forPerson: forPerson.role,
  }
}

// ---------- helpers ----------
function detectPerson(text) {
  const map = [
    { role: 'mom',    re: /\bnh[aă]?c\s+(m[ẹe])\b/i,           label: 'mẹ' },
    { role: 'mom',    re: /\bremind\s+(mom|mother)\b/i,         label: 'mom' },
    { role: 'dad',    re: /\bnh[aă]?c\s+(ba|b[ốo]|cha)\b/i,    label: 'ba' },
    { role: 'dad',    re: /\bremind\s+(dad|father)\b/i,         label: 'dad' },
    { role: 'spouse', re: /\bnh[aă]?c\s+(v[ợo]|ch[ồo]ng|anh|em)\b/i, label: 'vợ/chồng' },
    { role: 'child',  re: /\bnh[aă]?c\s+(con|cháu|b[ée])\b/i,  label: 'con' },
  ]
  for (const m of map) {
    const x = text.match(m.re)
    if (x) return { role: m.role, label: m.label, match: x[0] }
  }
  return { role: 'me', match: null }
}

function detectRepeat(text) {
  if (/h[aằ]ng\s+ng[aà]y|m[ỗo]i\s+ng[aà]y|m[ỗo]i\s+(s[aá]ng|tr[ưu]a|chi[eề]u|t[oố]i)|every\s+day|daily/i.test(text)) {
    const m = text.match(/h[aằ]ng\s+ng[aà]y|m[ỗo]i\s+ng[aà]y|m[ỗo]i\s+(s[aá]ng|tr[ưu]a|chi[eề]u|t[oố]i)|every\s+day|daily/i)
    return { pattern: 'daily', match: m[0] }
  }
  if (/h[aằ]ng\s+tu[aầ]n|m[ỗo]i\s+tu[aầ]n|every\s+week|weekly/i.test(text)) {
    const m = text.match(/h[aằ]ng\s+tu[aầ]n|m[ỗo]i\s+tu[aầ]n|every\s+week|weekly/i)
    return { pattern: 'weekly', match: m[0] }
  }
  if (/h[aằ]ng\s+th[aá]ng|m[ỗo]i\s+th[aá]ng|every\s+month|monthly/i.test(text)) {
    const m = text.match(/h[aằ]ng\s+th[aá]ng|m[ỗo]i\s+th[aá]ng|every\s+month|monthly/i)
    return { pattern: 'monthly', match: m[0] }
  }
  return { pattern: 'none', match: null }
}

function detectTime(text) {
  // "9 giờ", "9:30", "9 PM", "9:00 PM"
  const re1 = /\b(\d{1,2})\s*:\s*(\d{2})\s*(am|pm|s[aá]ng|tr[ưu]a|chi[eề]u|t[oố]i)?\b/i
  const re2 = /\b(\d{1,2})\s*(?:gi[ờo]|h(?!\d))\s*(\d{1,2})?\s*(s[aá]ng|tr[ưu]a|chi[eề]u|t[oố]i|am|pm)?\b/i
  const re3 = /\b(\d{1,2})\s*(am|pm)\b/i

  let m = text.match(re1) || text.match(re2) || text.match(re3)
  if (!m) {
    // word-only "buổi sáng" → 9, "buổi tối" → 21
    if (/\bs[aá]ng\b/i.test(text)) return { hour: 9, minute: 0, match: text.match(/\bs[aá]ng\b/i)[0] }
    if (/\btr[ưu]a\b/i.test(text)) return { hour: 12, minute: 0, match: text.match(/\btr[ưu]a\b/i)[0] }
    if (/\bchi[eề]u\b/i.test(text)) return { hour: 15, minute: 0, match: text.match(/\bchi[eề]u\b/i)[0] }
    if (/\bt[oố]i\b/i.test(text)) return { hour: 20, minute: 0, match: text.match(/\bt[oố]i\b/i)[0] }
    return { match: null }
  }

  let hour = parseInt(m[1], 10)
  let minute = parseInt(m[2] || '0', 10) || 0
  const period = (m[3] || '').toLowerCase()
  if (period === 'pm' || /chi[eề]u|t[oố]i/i.test(period)) { if (hour < 12) hour += 12 }
  else if (period === 'am' || /s[aá]ng/i.test(period)) { if (hour === 12) hour = 0 }
  else if (/tr[ưu]a/i.test(period) && hour < 12) { hour += 12 }
  return { hour, minute, match: m[0] }
}

function detectDay(text) {
  // ngày X hàng tháng / on the Xth
  const monthly = text.match(/ng[aà]y\s+(\d{1,2})\s*(?:h[aà]ng\s+th[aá]ng)?|day\s+(\d{1,2})/i)
  if (monthly) {
    const d = parseInt(monthly[1] || monthly[2], 10)
    if (d >= 1 && d <= 31) return { dayOfMonth: d, match: monthly[0] }
  }

  // weekdays
  const weekdayMap = [
    { day: 0, re: /\bch[uủ]\s*nh[aậ]t|sunday\b/i },
    { day: 1, re: /\bth[uứ]\s*hai|monday\b/i },
    { day: 2, re: /\bth[uứ]\s*ba|tuesday\b/i },
    { day: 3, re: /\bth[uứ]\s*t[uư]|wednesday\b/i },
    { day: 4, re: /\bth[uứ]\s*n[aă]m|thursday\b/i },
    { day: 5, re: /\bth[uứ]\s*s[aá]u|friday\b/i },
    { day: 6, re: /\bth[uứ]\s*b[aả]y|saturday\b/i },
  ]
  for (const w of weekdayMap) {
    const m = text.match(w.re)
    if (m) return { dayOfWeek: w.day, match: m[0] }
  }

  // "ngày mai", "tomorrow", "hôm nay", "today"
  if (/\bng[aà]y\s+mai|s[aá]ng\s+mai|t[oố]i\s+mai|tomorrow\b/i.test(text)) {
    return { offsetDays: 1, match: text.match(/ng[aà]y\s+mai|s[aá]ng\s+mai|t[oố]i\s+mai|tomorrow/i)[0] }
  }
  if (/\bh[oô]m\s+nay|today\b/i.test(text)) {
    return { offsetDays: 0, match: text.match(/h[oô]m\s+nay|today/i)[0] }
  }
  return { match: null }
}

function buildDueAt({ pattern, day, tod }) {
  const now = new Date()
  let d = new Date(now)
  d.setSeconds(0, 0)

  if (day.offsetDays != null) {
    d.setDate(d.getDate() + day.offsetDays)
  } else if (day.dayOfWeek != null) {
    const diff = (day.dayOfWeek - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
  } else if (day.dayOfMonth != null) {
    if (d.getDate() > day.dayOfMonth) d.setMonth(d.getMonth() + 1)
    d.setDate(day.dayOfMonth)
  }

  if (tod.hour != null) {
    d.setHours(tod.hour, tod.minute || 0, 0, 0)
    // If no day reference and time already passed today, push to next occurrence
    if (day.offsetDays == null && day.dayOfWeek == null && day.dayOfMonth == null && d <= now) {
      if (pattern === 'daily' || pattern === 'none') d.setDate(d.getDate() + 1)
      else if (pattern === 'weekly') d.setDate(d.getDate() + 7)
      else if (pattern === 'monthly') d.setMonth(d.getMonth() + 1)
    }
  } else {
    // No time specified → default 9 AM
    d.setHours(9, 0, 0, 0)
    if (d <= now && day.offsetDays == null) d.setDate(d.getDate() + 1)
  }
  return d
}

function detectCategory(text) {
  const t = text.toLowerCase()
  if (/thu[oố]c|medicat|medicine|pill|prescription/i.test(t)) return 'medication'
  if (/bill|h[oó]a\s*[đd][oơ]n|tr[aả]\s+ti[eề]n|tr[aả]\s+bill|[đd]i[eệ]n|n[ưu][oớ]c|internet|rent|mortgage|insurance|b[aả]o\s+hi[eể]m/i.test(t)) return 'bill'
  if (/b[aá]c\s*s[iĩ]|kh[aá]m|doctor|appointment|h[ẹe]n|d[aă]ng\s*k[yý]/i.test(t)) return 'appointment'
  if (/m[ẹe]|ba\b|cha|v[ợo]|ch[oồ]ng|con|gia\s*[đd][ìi]nh|family|mom|dad|wife|husband/i.test(t)) return 'family'
  if (/h[oọ]p|meeting|email|c[oô]ng\s*vi[eệ]c|work|project|deadline|report|b[aá]o\s*c[aá]o/i.test(t)) return 'work'
  if (/t[aậ]p|gym|workout|[đd]i\s*b[oộ]|y[oơ]ga|read|s[aá]ch|hobby|c[aá]\s+nh[aâ]n/i.test(t)) return 'personal'
  return 'other'
}

function cleanTitle(text) {
  return String(text)
    .replace(/^\s*(nh[aá]?c|nh[aă]?c\s+nh[oở]|remind|please\s+remind)\s+(t[oô]i|m[ìi]nh|me|us)?\s*/i, '')
    .replace(/^\s*l[uú]c\s+/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '')
    .trim()
}

// ---------- next occurrence (for repeats) ----------
export function nextOccurrence(reminder, from = new Date()) {
  const cur = new Date(reminder.dueAt)
  if (reminder.repeat === 'none' || !reminder.repeat) return null
  const next = new Date(cur)
  while (next <= from) {
    if (reminder.repeat === 'daily') next.setDate(next.getDate() + 1)
    else if (reminder.repeat === 'weekly') next.setDate(next.getDate() + 7)
    else if (reminder.repeat === 'monthly') next.setMonth(next.getMonth() + 1)
    else break
  }
  return next
}

// ---------- grouping for the Today view ----------
export function groupByStatus(reminders, now = new Date()) {
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1)

  const overdue = [], today = [], upcoming = [], done = []
  for (const r of reminders) {
    if (r.completedAt && r.repeat === 'none') { done.push(r); continue }
    const due = new Date(r.dueAt)
    if (due < now && !r.completedAt) overdue.push(r)
    else if (due >= startOfToday && due < endOfToday) today.push(r)
    else if (due >= endOfToday) upcoming.push(r)
  }
  const byDate = (a, b) => new Date(a.dueAt) - new Date(b.dueAt)
  return {
    overdue: overdue.sort(byDate),
    today: today.sort(byDate),
    upcoming: upcoming.sort(byDate).slice(0, 10),
    done,
  }
}

// ---------- relative time formatter ----------
export function relativeTime(iso, lang = 'vi') {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const tom = new Date(now); tom.setDate(tom.getDate() + 1)
  const isTomorrow = d.toDateString() === tom.toDateString()
  const yest = new Date(now); yest.setDate(yest.getDate() - 1)
  const isYesterday = d.toDateString() === yest.toDateString()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (sameDay) return time
  if (isTomorrow) return (lang === 'vi' ? 'Mai · ' : 'Tomorrow · ') + time
  if (isYesterday) return (lang === 'vi' ? 'Hôm qua · ' : 'Yesterday · ') + time

  const dayOfWeek = d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short' })
  const dateStr = d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })
  return dayOfWeek + ', ' + dateStr + ' · ' + time
}

export function greetingFor(lang = 'vi', now = new Date()) {
  const h = now.getHours()
  if (lang === 'vi') {
    if (h < 11) return 'Chào buổi sáng'
    if (h < 14) return 'Chào buổi trưa'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
