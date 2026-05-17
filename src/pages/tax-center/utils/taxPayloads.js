import { todayISO } from '../../../lib/lifeStore.js'
import { money } from './taxMath.js'

export function buildWorkerPayload(userId, form, year) {
  const total = money(form.work_pay) + money(form.tips)
  const taxId = form.ssn || null
  const common = {
    user_id: userId,
    name: form.name,
    address: form.address || null,
    street: form.address || null,
    work_pay: money(form.work_pay),
    tips: money(form.tips),
    total_pay: total,
    tax_year: Number(form.tax_year || year),
    notes: form.notes || null,
  }

  if (form.type === 'W2') {
    return { table: 'biz_workers_w2', payload: { ...common, ssn: taxId, ssn_text: taxId, ssn_last4: String(taxId || '').slice(-4), wages: total } }
  }

  return { table: 'biz_workers_1099', payload: { ...common, tin: taxId, tin_text: taxId, tin_last4: String(taxId || '').slice(-4), payments: total } }
}

export function buildIncomePayload(userId, form) {
  return {
    user_id: userId,
    source: form.source,
    category: form.category || 'salon_income',
    amount: money(form.amount),
    record_date: form.record_date || todayISO(),
    notes: form.notes || null,
  }
}


export function buildExpensePayload(userId, form) {
  return {
    profile_id: userId,
    title: form.title,
    amount: money(form.amount),
    category: form.category || 'other_business',
    expense_type: 'business',
    recurring: Boolean(form.recurring),
    recurring_pattern: form.recurring_pattern || form.recurringPattern || 'none',
    tax_category: form.tax_category || form.taxCategory || form.category || 'other_business',
    expense_date: form.date || form.expense_date || todayISO(),
    notes: form.note || form.notes || null,
  }
}
