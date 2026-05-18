import { todayISO } from './lifeStore.js'

const INTENTS = {
  REMINDER: 'reminder',
  BILL: 'bill',
  EXPENSE: 'expense',
}

const BILL_WORDS = [
  'bill', 'pay bill', 'payment', 'due', 'electric', 'electricity', 'power', 'water', 'internet', 'rent', 'mortgage', 'insurance', 'phone', 'tmobile', 'at&t', 'credit card', 'car payment',
  'hoa don', 'hóa đơn', 'dong tien', 'đóng tiền', 'dong', 'đóng', 'tra tien', 'trả tiền', 'tra', 'trả', 'dien', 'điện', 'nuoc', 'nước', 'tien nha', 'tiền nhà', 'bao hiem', 'bảo hiểm', 'the tin dung', 'thẻ tín dụng',
]

const EXPENSE_WORDS = [
  'expense', 'spent', 'paid', 'buy', 'bought', 'lunch', 'dinner', 'food', 'coffee', 'gas', 'fuel', 'supplies', 'supply', 'nails', 'uber', 'doordash', 'cost',
  'chi tieu', 'chi tiêu', 'an', 'ăn', 'xang', 'xăng', 'mua', 'cafe', 'ca phe', 'cà phê', 'vat tu', 'vật tư', 'do nghe', 'đồ nghề', 'tốn', 'ton', 'xài', 'xai',
]

const REMINDER_WORDS = [
  'remind', 'reminder', 'remember', 'call', 'go', 'pick up', 'appointment', 'doctor', 'dentist', 'flight', 'meeting', 'renew', 'deadline',
  'nhac', 'nhắc', 'nho', 'nhớ', 'goi', 'gọi', 'di', 'đi', 'hen', 'hẹn', 'lich', 'lịch', 'deadline', 'bay', 'kham', 'khám',
]

const TRAVEL_WORDS = ['bay', 'flight', 'fly', 'airport', 'sân bay', 'san bay', 'viet nam', 'việt nam', 'travel', 'trip', 've vn', 'về vn']
const BUSINESS_WORDS = ['salon', 'nail', 'business', 'tiem', 'tiệm', 'tho', 'thợ', 'payroll', 'luong', 'lương', 'supplies', 'supply', 'w2', '1099']
const HEALTH_WORDS = ['doctor', 'dentist', 'medicine', 'thuoc', 'thuốc', 'bac si', 'bác sĩ', 'health', 'kham', 'khám']
const FAMILY_WORDS = ['wife', 'kids', 'mom', 'dad', 'family', 'vo', 'vợ', 'con', 'me ', 'mẹ ', 'ba ', 'bo ', 'bố ']
const WORK_WORDS = ['work', 'job', 'shift', 'uber', 'doordash', 'appointment', 'client', 'khach', 'khách', 'lam', 'làm']

function stripAccent(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function plain(text) {
  return stripAccent(text).replace(/[^a-z0-9/$:.\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function rawLower(text) {
  return String(text || '').toLowerCase()
}

function hasAny(text, words) {
  const raw = rawLower(text)
  const normalized = plain(text)
  return words.some((word) => raw.includes(String(word).toLowerCase()) || normalized.includes(plain(word)))
}

function scoreWords(text, words) {
  return words.reduce((score, word) => score + (hasAny(text, [word]) ? 1 : 0), 0)
}

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return todayISO(d)
}

function nextWeekday(targetDay) {
  const d = new Date()
  const diff = (targetDay + 7 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + diff)
  return todayISO(d)
}

function dateFromDay(day) {
  const now = new Date()
  const wanted = Math.min(Math.max(Number(day || 1), 1), 31)
  const thisMonthLast = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  let d = new Date(now.getFullYear(), now.getMonth(), Math.min(wanted, thisMonthLast))
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    const nextLast = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
    d = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(wanted, nextLast))
  }
  return todayISO(d)
}

function dateFromMonthDay(month, day) {
  const now = new Date()
  const m = Math.min(Math.max(Number(month || now.getMonth() + 1), 1), 12) - 1
  const wanted = Math.min(Math.max(Number(day || 1), 1), 31)
  const last = new Date(now.getFullYear(), m + 1, 0).getDate()
  let d = new Date(now.getFullYear(), m, Math.min(wanted, last))
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    const nextLast = new Date(now.getFullYear() + 1, m + 1, 0).getDate()
    d = new Date(now.getFullYear() + 1, m, Math.min(wanted, nextLast))
  }
  return todayISO(d)
}

export function parseDate(text) {
  const normalized = plain(text)
  if (/\b(today|hom nay|hnay|bua nay)\b/.test(normalized)) return todayISO()
  if (/\b(tomorrow|mai|ngay mai)\b/.test(normalized)) return addDays(1)
  if (/\b(day after tomorrow|moi kia|mot kia)\b/.test(normalized)) return addDays(2)
  if (/\b(next week|tuan toi|tuan sau)\b/.test(normalized)) return addDays(7)

  const weekdays = [
    ['sunday', 'chu nhat', 'cn'], ['monday', 'thu hai', 't2'], ['tuesday', 'thu ba', 't3'], ['wednesday', 'thu tu', 't4'],
    ['thursday', 'thu nam', 't5'], ['friday', 'thu sau', 't6'], ['saturday', 'thu bay', 't7'],
  ]
  const weekday = weekdays.findIndex((names) => names.some((name) => new RegExp(`\\b${name}\\b`).test(normalized)))
  if (weekday >= 0) return nextWeekday(weekday)

  const slash = normalized.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
  if (slash) {
    const first = Number(slash[1])
    const second = Number(slash[2])
    if (first > 12) return dateFromMonthDay(second, first)
    return dateFromMonthDay(first, second)
  }

  const monthDay = normalized.match(/(?:thang|month)\s*(\d{1,2})\s*(?:ngay|day)?\s*(\d{1,2})\b/) || normalized.match(/\b(\d{1,2})\s*(?:thang)\s*(\d{1,2})\b/)
  if (monthDay) return dateFromMonthDay(monthDay[1], monthDay[2])

  const dayMatch = normalized.match(/(?:ngay|date|day|due)\s*(\d{1,2})\b/) || normalized.match(/\b(\d{1,2})\s*(?:tay|toi han|due)\b/)
  if (dayMatch) return dateFromDay(dayMatch[1])

  return todayISO()
}

function parseDueDay(text) {
  const normalized = plain(text)
  const match = normalized.match(/(?:ngay|date|day|due)\s*(\d{1,2})\b/) || normalized.match(/\b(\d{1,2})\s*(?:hang thang|moi thang|monthly)\b/)
  if (match) return Math.min(Math.max(Number(match[1]), 1), 31)
  return new Date(`${parseDate(text)}T00:00:00`).getDate()
}

export function parseTime(text) {
  const normalized = plain(text)
  const timeWithMarker = normalized.match(/(?:luc|at|khoang|around)?\s*\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|sang|trua|chieu|toi|dem)\b/)
  if (timeWithMarker) {
    let h = Number(timeWithMarker[1])
    const m = Number(timeWithMarker[2] || 0)
    const period = timeWithMarker[3] || ''
    if ((period === 'pm' || period === 'chieu' || period === 'toi' || period === 'dem') && h < 12) h += 12
    if ((period === 'am' || period === 'sang') && h === 12) h = 0
    if (period === 'trua' && h < 11) h += 12
    if (h <= 23 && m <= 59) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const clock = normalized.match(/(?:luc|at)\s*(\d{1,2})(?::(\d{2}))?\b/)
  if (clock) {
    const h = Number(clock[1])
    const m = Number(clock[2] || 0)
    if (h <= 23 && m <= 59) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  if (/\b(morning|sang)\b/.test(normalized)) return '09:00'
  if (/\b(noon|trua)\b/.test(normalized)) return '12:00'
  if (/\b(afternoon|chieu)\b/.test(normalized)) return '15:00'
  if (/\b(night|evening|toi|dem)\b/.test(normalized)) return '20:00'
  return ''
}

export function parseAmount(text) {
  const normalized = plain(text).replace(/,/g, '')
  const moneyMatch = normalized.match(/(?:\$|usd|do|dollar)\s*(\d+(?:\.\d{1,2})?)/) || normalized.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:usd|do|dollar|\$)\b/)
  if (moneyMatch) return Number(moneyMatch[1])
  const amountAfterKeyword = normalized.match(/(?:amount|cost|total|het|hết|ton|tốn|xai|xài)\s*(\d+(?:\.\d{1,2})?)\b/)
  if (amountAfterKeyword) return Number(amountAfterKeyword[1])
  const numbers = [...normalized.matchAll(/\b(\d+(?:\.\d{1,2})?)\b/g)].map((m) => Number(m[1]))
  if (!numbers.length) return 0
  const likelyMoney = hasAny(text, EXPENSE_WORDS) || hasAny(text, BILL_WORDS) || /\$/.test(text)
  if (!likelyMoney) return 0
  const filtered = numbers.filter((n) => n > 0 && n !== parseDueDay(text))
  return filtered[0] || numbers[0] || 0
}

function removeNoise(text) {
  return String(text || '')
    .replace(/^\s*(nhắc|nhac|remind|remember)(\s+tôi|\s+mình|\s+me)?\s*/i, '')
    .replace(/\b(ngày|ngay|day|date|due|tháng|thang|month)\s*\d{1,2}\b/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g, '')
    .replace(/\b(today|tomorrow|hôm nay|hom nay|mai|ngày mai|ngay mai|next week|tuần sau|tuan sau)\b/gi, '')
    .replace(/\b(lúc|luc|at|around|khoảng|khoang)\s*\d{1,2}(:\d{2})?\s*(am|pm|sáng|sang|trưa|trua|chiều|chieu|tối|toi|đêm|dem)?\b/gi, '')
    .replace(/\b\d+(\.\d{1,2})?\s*(usd|đô|do|dollar|\$)\b/gi, '')
    .replace(/\$\s*\d+(\.\d{1,2})?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanTitle(text) {
  const title = removeNoise(text)
  return title || String(text || '').trim()
}

function categoryFor(text, fallback = 'personal') {
  if (hasAny(text, TRAVEL_WORDS)) return 'travel'
  if (hasAny(text, BUSINESS_WORDS)) return 'business'
  if (hasAny(text, HEALTH_WORDS)) return 'health'
  if (hasAny(text, FAMILY_WORDS)) return 'family'
  if (hasAny(text, WORK_WORDS)) return 'work'
  if (hasAny(text, BILL_WORDS)) return 'bill'
  return fallback
}

function expenseCategoryFor(text) {
  if (hasAny(text, ['gas', 'fuel', 'xang', 'xăng'])) return 'gas'
  if (hasAny(text, ['food', 'lunch', 'dinner', 'coffee', 'an', 'ăn', 'cafe', 'ca phe', 'cà phê'])) return 'food'
  if (hasAny(text, ['supply', 'supplies', 'vat tu', 'vật tư', 'do nghe', 'đồ nghề'])) return 'supply'
  if (hasAny(text, ['salon', 'nail', 'tiem nail', 'tiệm nail'])) return 'salon'
  if (hasAny(text, BUSINESS_WORDS)) return 'business'
  if (hasAny(text, BILL_WORDS)) return 'bill'
  return 'personal'
}

function repeatFor(text) {
  const normalized = plain(text)
  if (/\b(every day|daily|moi ngay|hang ngay|hằng ngày|hàng ngày)\b/.test(normalized)) return 'daily'
  if (/\b(every week|weekly|moi tuan|hang tuan|hằng tuần|hàng tuần)\b/.test(normalized)) return 'weekly'
  if (/\b(every month|monthly|moi thang|hang thang|hằng tháng|hàng tháng)\b/.test(normalized)) return 'monthly'
  return 'none'
}

function detectIntent(text) {
  const amount = parseAmount(text)
  const billScore = scoreWords(text, BILL_WORDS)
  const expenseScore = scoreWords(text, EXPENSE_WORDS)
  const reminderScore = scoreWords(text, REMINDER_WORDS)

  if (billScore >= 1 && (amount > 0 || /\b(ngay|due|date|hang thang|monthly)\b/.test(plain(text)))) return INTENTS.BILL
  if (amount > 0 && expenseScore >= 1) return INTENTS.EXPENSE
  if (billScore > expenseScore && billScore >= 1) return INTENTS.BILL
  if (amount > 0 && billScore === 0 && !hasAny(text, TRAVEL_WORDS)) return INTENTS.EXPENSE
  if (reminderScore >= 1 || hasAny(text, TRAVEL_WORDS)) return INTENTS.REMINDER
  return INTENTS.REMINDER
}

function confidenceFor({ raw, type, amount, date, time, title }) {
  let score = 0.52
  if (title && title.length >= 3) score += 0.12
  if (date && date !== todayISO()) score += 0.12
  if (time) score += 0.08
  if (type === INTENTS.BILL && hasAny(raw, BILL_WORDS)) score += 0.16
  if (type === INTENTS.EXPENSE && amount > 0) score += 0.2
  if (type === INTENTS.EXPENSE && hasAny(raw, EXPENSE_WORDS)) score += 0.08
  if (type === INTENTS.REMINDER && (hasAny(raw, REMINDER_WORDS) || hasAny(raw, TRAVEL_WORDS))) score += 0.12
  if (amount > 0 && type !== INTENTS.REMINDER) score += 0.04
  if (String(raw || '').trim().split(/\s+/).length <= 2) score -= 0.1
  return Math.max(0.35, Math.min(0.97, Number(score.toFixed(2))))
}

function needsAiFallback(parsed) {
  if (!parsed.ok) return false
  if (parsed.confidence < 0.68) return true
  const title = parsed.item?.title || parsed.item?.name || ''
  if (!title || title.length < 3) return true
  if (parsed.type !== INTENTS.REMINDER && Number(parsed.item?.amount || 0) <= 0) return true
  return false
}

export function parseSmartEntry(text) {
  const raw = String(text || '').trim()
  if (!raw) return { ok: false, type: 'empty', confidence: 0, needsAiFallback: false }

  const type = detectIntent(raw)
  const title = cleanTitle(raw)
  const amount = parseAmount(raw)
  const date = parseDate(raw)
  const time = parseTime(raw)
  const confidence = confidenceFor({ raw, type, amount, date, time, title })
  const meta = {
    raw,
    confidence,
    needsAiFallback: false,
    parser: 'smart-lite-v2',
  }

  let parsed
  if (type === INTENTS.EXPENSE) {
    parsed = {
      ok: true,
      type,
      confidence,
      item: {
        title,
        amount,
        category: expenseCategoryFor(raw),
        date,
        note: '',
        source: 'smart-lite',
      },
      meta,
    }
  } else if (type === INTENTS.BILL) {
    parsed = {
      ok: true,
      type,
      confidence,
      item: {
        name: title,
        title,
        amount,
        category: 'bill',
        dueDay: parseDueDay(raw),
        auto_reminder: true,
        source: 'smart-lite',
      },
      meta,
    }
  } else {
    parsed = {
      ok: true,
      type: INTENTS.REMINDER,
      confidence,
      item: {
        title,
        category: categoryFor(raw),
        repeat: repeatFor(raw),
        date,
        time,
        done: false,
        notes: '',
        source: 'smart-lite',
      },
      meta,
    }
  }

  parsed.needsAiFallback = needsAiFallback(parsed)
  parsed.meta.needsAiFallback = parsed.needsAiFallback
  return parsed
}

export function parseSmartReminder(text) {
  const parsed = parseSmartEntry(text)
  if (parsed.type === INTENTS.REMINDER) return parsed.item
  return {
    title: parsed.item?.title || parsed.item?.name || String(text || '').trim(),
    category: parsed.type === INTENTS.BILL ? 'bill' : categoryFor(text),
    repeat: parsed.type === INTENTS.BILL ? 'monthly' : repeatFor(text),
    date: parseDate(text),
    time: parseTime(text),
    notes: '',
  }
}

export function explainParsedSmartEntry(parsed, lang = 'vi') {
  if (!parsed?.ok) return ''
  const type = parsed.type === INTENTS.BILL ? (lang === 'vi' ? 'hóa đơn' : 'bill') : parsed.type === INTENTS.EXPENSE ? (lang === 'vi' ? 'chi tiêu' : 'expense') : (lang === 'vi' ? 'nhắc việc' : 'reminder')
  const percent = Math.round((parsed.confidence || 0) * 100)
  return lang === 'vi'
    ? `TXPick hiểu đây là ${type} (${percent}% tự tin).`
    : `TXPick understood this as a ${type} (${percent}% confidence).`
}
