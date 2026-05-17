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

export const businessExpenseGroups = [
  { key: 'supplies', en: 'Supplies' },
  { key: 'utilities', en: 'Utilities' },
  { key: 'rent', en: 'Rent / lease' },
  { key: 'payroll', en: 'Labor / payroll' },
  { key: 'insurance', en: 'Insurance' },
  { key: 'advertising', en: 'Advertising / marketing' },
  { key: 'phone_internet', en: 'Phone / Internet' },
  { key: 'repairs', en: 'Repairs / maintenance' },
  { key: 'office', en: 'Office expense' },
  { key: 'accounting', en: 'Accounting' },
  { key: 'legal_professional', en: 'Legal / professional fees' },
  { key: 'taxes', en: 'Taxes' },
  { key: 'car_truck', en: 'Car / truck' },
  { key: 'fuel', en: 'Fuel / oil' },
  { key: 'gift', en: 'Gift' },
  { key: 'other_business', en: 'Other business' },
]

export const businessExpenseCategories = [
  'business', 'salon', 'supply', 'supplies', 'marketing', 'advertising', 'transportation',
  'utility', 'utilities', 'rent', 'payroll', 'labor', 'insurance', 'software', 'tax', 'taxes',
  'phone_internet', 'repairs', 'office', 'accounting', 'legal_professional', 'car_truck', 'fuel', 'gift', 'other_business',
]
