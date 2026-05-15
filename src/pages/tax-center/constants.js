import { todayISO } from '../../lib/lifeStore.js'

export const currentYear = new Date().getFullYear()

export const emptyWorker = {
  type: '1099',
  name: '',
  ssn: '',
  address: '',
  work_pay: '',
  tips: '',
  tax_year: currentYear,
  notes: '',
}

export const emptyIncome = {
  source: '',
  category: 'salon_income',
  amount: '',
  record_date: todayISO(),
  notes: '',
}

export const businessExpenseCategories = [
  'business', 'salon', 'supply', 'supplies', 'marketing', 'transportation',
  'utility', 'utilities', 'rent', 'payroll', 'insurance', 'software', 'tax',
]
