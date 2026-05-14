import { fmtUSD, isCurrentMonth, isSameDay, monthKey, todayISO } from './lifeStore.js'

const BUSINESS_CATEGORIES = new Set(['business', 'salon', 'supply', 'supplies', 'gas', 'marketing', 'advertising', 'vehicle'])

export function dateDiffDays(isoDate) {
  if (!isoDate) return null
  const a = new Date(`${todayISO()}T00:00:00`)
  const b = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(b.getTime())) return null
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function isBusinessExpense(expense = {}) {
  return BUSINESS_CATEGORIES.has(expense.category) || expense.expense_type === 'business'
}

export function getReminderBuckets(reminders = []) {
  const open = reminders.filter((r) => !r.done && !r.completed)
  return {
    overdue: open.filter((r) => dateDiffDays(r.date) < 0),
    today: open.filter((r) => isSameDay(r.date)),
    upcoming: open
      .filter((r) => dateDiffDays(r.date) > 0)
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))),
    completed: reminders.filter((r) => r.done || r.completed),
  }
}

export function getBillBuckets(bills = []) {
  const unpaid = bills.filter((b) => !b.paid)
  return {
    overdue: unpaid.filter((b) => dateDiffDays(b.dueDate || b.due_date) < 0),
    dueToday: unpaid.filter((b) => dateDiffDays(b.dueDate || b.due_date) === 0),
    dueSoon: unpaid.filter((b) => {
      const d = dateDiffDays(b.dueDate || b.due_date)
      return d !== null && d > 0 && d <= 7
    }),
    unpaid,
    paid: bills.filter((b) => b.paid),
  }
}

export function buildTodayActionCards({ reminders = [], bills = [], expenses = [], lang = 'vi' }) {
  const r = getReminderBuckets(reminders)
  const b = getBillBuckets(bills)
  const todayExpenses = expenses.filter((e) => isSameDay(e.date || e.expense_date))
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const cards = []

  if (r.overdue.length) {
    cards.push({
      id: 'overdue-reminders',
      tone: 'danger',
      title: lang === 'vi' ? 'Xử lý việc quá hạn trước' : 'Clear overdue reminders first',
      body: lang === 'vi'
        ? `${r.overdue.length} việc đã quá hạn. Bấm hoàn thành những việc đã làm xong.`
        : `${r.overdue.length} overdue reminder(s). Complete anything already done.`,
      href: '/reminders',
      score: 100,
    })
  }

  if (b.overdue.length || b.dueToday.length) {
    cards.push({
      id: 'urgent-bills',
      tone: 'danger',
      title: lang === 'vi' ? 'Kiểm tra hóa đơn nguy hiểm' : 'Review urgent bills',
      body: lang === 'vi'
        ? `${b.overdue.length} quá hạn, ${b.dueToday.length} tới hạn hôm nay.`
        : `${b.overdue.length} overdue, ${b.dueToday.length} due today.`,
      href: '/bills',
      score: 95,
    })
  }

  if (r.today.length) {
    cards.push({
      id: 'today-reminders',
      tone: 'brand',
      title: lang === 'vi' ? 'Việc cần làm hôm nay' : 'Today reminders',
      body: lang === 'vi'
        ? `${r.today.length} việc cần nhớ trong ngày hôm nay.`
        : `${r.today.length} reminder(s) due today.`,
      href: '/reminders',
      score: 80,
    })
  }

  if (b.dueSoon.length) {
    cards.push({
      id: 'bills-soon',
      tone: 'gold',
      title: lang === 'vi' ? 'Bill sắp tới hạn' : 'Bills due soon',
      body: lang === 'vi'
        ? `${b.dueSoon.length} hóa đơn sẽ tới hạn trong 7 ngày.`
        : `${b.dueSoon.length} bill(s) due within 7 days.`,
      href: '/bills',
      score: 70,
    })
  }

  cards.push({
    id: 'today-spending',
    tone: todayExpenseTotal > 0 ? 'ink' : 'brand',
    title: lang === 'vi' ? 'Chi tiêu hôm nay' : 'Today spending',
    body: lang === 'vi'
      ? todayExpenseTotal > 0 ? `Đã ghi ${fmtUSD(todayExpenseTotal)} hôm nay.` : 'Chưa ghi chi tiêu hôm nay. Nhập ngay nếu có để khỏi quên.'
      : todayExpenseTotal > 0 ? `${fmtUSD(todayExpenseTotal)} logged today.` : 'No spending logged today yet.',
    href: '/expenses',
    score: 40,
  })

  return cards.sort((a, b2) => b2.score - a.score).slice(0, 4)
}

export function buildTodayFocus({ reminders = [], bills = [], expenses = [], lang = 'vi' }) {
  const r = getReminderBuckets(reminders)
  const b = getBillBuckets(bills)
  const todayExpenses = expenses.filter((e) => isSameDay(e.date || e.expense_date))
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  if (lang === 'en') {
    if (r.overdue.length || b.overdue.length) {
      return `Priority: ${r.overdue.length} overdue reminder(s) and ${b.overdue.length} overdue bill(s). Clear these first before adding more tasks.`
    }
    if (r.today.length || b.dueToday.length || b.dueSoon.length) {
      return `Today focus: ${r.today.length} reminder(s), ${b.dueToday.length} bill(s) due today, ${b.dueSoon.length} bill(s) due soon, and ${fmtUSD(todayExpenseTotal)} spent today.`
    }
    return 'Today looks light. Add one important reminder or log any spending before the day gets busy.'
  }

  if (r.overdue.length || b.overdue.length) {
    return `Ưu tiên trước: bạn có ${r.overdue.length} việc quá hạn và ${b.overdue.length} hóa đơn quá hạn. Xử lý nhóm này trước cho nhẹ đầu.`
  }
  if (r.today.length || b.dueToday.length || b.dueSoon.length) {
    return `Trọng tâm hôm nay: ${r.today.length} việc cần nhớ, ${b.dueToday.length} hóa đơn tới hạn hôm nay, ${b.dueSoon.length} hóa đơn sắp tới hạn, và ${fmtUSD(todayExpenseTotal)} chi tiêu hôm nay.`
  }
  return 'Hôm nay khá nhẹ. Bạn có thể thêm một việc quan trọng hoặc ghi lại chi tiêu trước khi quên.'
}

export function buildDailyBriefing({ reminders = [], bills = [], expenses = [], lang = 'vi' }) {
  const r = getReminderBuckets(reminders)
  const b = getBillBuckets(bills)
  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.date || e.expense_date))
  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const business = monthExpenses.filter(isBusinessExpense).reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const personal = total - business

  if (lang === 'en') {
    return [
      `Today: ${r.today.length} reminder(s), ${r.overdue.length} overdue reminder(s).`,
      `Bills: ${b.dueToday.length} due today, ${b.dueSoon.length} due soon, ${b.overdue.length} overdue.`,
      `This month: ${fmtUSD(total)} total spending — ${fmtUSD(business)} business and ${fmtUSD(personal)} personal.`,
      r.overdue.length || b.overdue.length ? 'Best next action: clear overdue items first.' : 'Best next action: add anything important before the day gets busy.',
    ]
  }

  return [
    `Hôm nay: ${r.today.length} việc cần nhớ, ${r.overdue.length} việc quá hạn.`,
    `Hóa đơn: ${b.dueToday.length} tới hạn hôm nay, ${b.dueSoon.length} sắp tới hạn, ${b.overdue.length} quá hạn.`,
    `Tháng này: ${fmtUSD(total)} tổng chi tiêu — ${fmtUSD(business)} business và ${fmtUSD(personal)} cá nhân.`,
    r.overdue.length || b.overdue.length ? 'Việc nên làm trước: xử lý nhóm quá hạn.' : 'Việc nên làm trước: thêm việc quan trọng trước khi bận.',
  ]
}

export function buildMonthlySummary({ expenses = [], bills = [], lang = 'vi' }) {
  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.date || e.expense_date))
  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const business = monthExpenses.filter(isBusinessExpense).reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const personal = total - business
  const unpaidBills = bills.filter((b) => !b.paid).reduce((sum, b) => sum + Number(b.amount || 0), 0)

  if (lang === 'en') {
    return `This month: ${fmtUSD(total)} expenses, ${fmtUSD(business)} business, ${fmtUSD(personal)} personal, and ${fmtUSD(unpaidBills)} unpaid bills.`
  }
  return `Tháng này: ${fmtUSD(total)} chi tiêu, ${fmtUSD(business)} phần business, ${fmtUSD(personal)} phần cá nhân, và ${fmtUSD(unpaidBills)} hóa đơn chưa paid.`
}

export function groupExpensesByMonth(expenses = []) {
  const map = {}
  for (const e of expenses) {
    const m = monthKey(e.date || e.expense_date)
    if (!map[m]) map[m] = { business: 0, personal: 0, total: 0, count: 0 }
    const amount = Number(e.amount || 0)
    if (isBusinessExpense(e)) map[m].business += amount
    else map[m].personal += amount
    map[m].total += amount
    map[m].count += 1
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}

export function buildYearEndLines({ expenses = [], bills = [], reminders = [], lang = 'vi' }) {
  const rows = groupExpensesByMonth(expenses)
  const total = rows.reduce((sum, [, v]) => sum + v.total, 0)
  const business = rows.reduce((sum, [, v]) => sum + v.business, 0)
  const personal = rows.reduce((sum, [, v]) => sum + v.personal, 0)
  const billTotal = bills.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  const doneReminders = reminders.filter((r) => r.done || r.completed).length

  if (lang === 'en') {
    return [
      `Year expenses: ${fmtUSD(total)}`,
      `Business expenses: ${fmtUSD(business)}`,
      `Personal expenses: ${fmtUSD(personal)}`,
      `Monthly bills tracked: ${bills.length} / ${fmtUSD(billTotal)} total monthly amount`,
      `Completed reminders: ${doneReminders}`,
      '',
      'Monthly breakdown:',
      ...rows.map(([m, v]) => `${m}: ${fmtUSD(v.total)} total | ${fmtUSD(v.business)} business | ${fmtUSD(v.personal)} personal | ${v.count} record(s)`),
    ]
  }

  return [
    `Chi tiêu trong năm: ${fmtUSD(total)}`,
    `Chi tiêu business: ${fmtUSD(business)}`,
    `Chi tiêu cá nhân: ${fmtUSD(personal)}`,
    `Hóa đơn đang theo dõi: ${bills.length} / tổng mỗi tháng ${fmtUSD(billTotal)}`,
    `Việc đã hoàn thành: ${doneReminders}`,
    '',
    'Tổng kết theo tháng:',
    ...rows.map(([m, v]) => `${m}: ${fmtUSD(v.total)} tổng | ${fmtUSD(v.business)} business | ${fmtUSD(v.personal)} cá nhân | ${v.count} dòng`),
  ]
}
