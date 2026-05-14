import { fmtUSD, isCurrentMonth, isSameDay, monthKey, todayISO } from './lifeStore.js'

export function dateDiffDays(isoDate) {
  if (!isoDate) return null
  const a = new Date(`${todayISO()}T00:00:00`)
  const b = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(b.getTime())) return null
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function getReminderBuckets(reminders) {
  const open = reminders.filter((r) => !r.done && !r.completed)
  return {
    overdue: open.filter((r) => dateDiffDays(r.date) < 0),
    today: open.filter((r) => isSameDay(r.date)),
    upcoming: open.filter((r) => dateDiffDays(r.date) > 0).sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))),
    completed: reminders.filter((r) => r.done || r.completed),
  }
}

export function getBillBuckets(bills) {
  const unpaid = bills.filter((b) => !b.paid)
  return {
    overdue: unpaid.filter((b) => dateDiffDays(b.dueDate || b.due_date) < 0),
    dueSoon: unpaid.filter((b) => {
      const d = dateDiffDays(b.dueDate || b.due_date)
      return d !== null && d >= 0 && d <= 7
    }),
    paid: bills.filter((b) => b.paid),
  }
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
    if (r.today.length || b.dueSoon.length) {
      return `Today focus: ${r.today.length} reminder(s), ${b.dueSoon.length} bill(s) due soon, and ${fmtUSD(todayExpenseTotal)} spent today.`
    }
    return 'Today looks light. Add one important reminder or log any spending before the day gets busy.'
  }

  if (r.overdue.length || b.overdue.length) {
    return `Ưu tiên trước: bạn có ${r.overdue.length} việc quá hạn và ${b.overdue.length} hóa đơn quá hạn. Xử lý nhóm này trước cho nhẹ đầu.`
  }
  if (r.today.length || b.dueSoon.length) {
    return `Trọng tâm hôm nay: ${r.today.length} việc cần nhớ, ${b.dueSoon.length} hóa đơn sắp tới hạn, và ${fmtUSD(todayExpenseTotal)} chi tiêu hôm nay.`
  }
  return 'Hôm nay khá nhẹ. Bạn có thể thêm một việc quan trọng hoặc ghi lại chi tiêu trước khi quên.'
}

export function buildMonthlySummary({ expenses = [], bills = [], lang = 'vi' }) {
  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.date || e.expense_date))
  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const business = monthExpenses
    .filter((e) => ['business', 'salon', 'supply', 'gas', 'marketing'].includes(e.category) || e.expense_type === 'business')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0)
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
    const isBusiness = ['business', 'salon', 'supply', 'gas', 'marketing'].includes(e.category) || e.expense_type === 'business'
    if (isBusiness) map[m].business += amount
    else map[m].personal += amount
    map[m].total += amount
    map[m].count += 1
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}
