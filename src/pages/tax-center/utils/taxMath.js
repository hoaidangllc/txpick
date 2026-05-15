import { businessExpenseCategories } from '../constants.js'

export function money(value) {
  return Number(value || 0)
}

export function workerTotal(row) {
  return money(row.work_pay ?? row.wages ?? row.payments) + money(row.tips)
}

export function addressFrom(row) {
  return row.address || [row.street, row.city, row.state, row.zip].filter(Boolean).join(', ')
}

export function isBusinessExpense(expense) {
  return expense.expense_type === 'business' || businessExpenseCategories.includes(expense.category)
}

export function inTaxYear(dateValue, year) {
  return String(dateValue || '').startsWith(String(year))
}
