export function money(value) { return Number(value || 0) }
export function workerTotal(row) { return money(row.work_pay ?? row.wages ?? row.payments) + money(row.tips) }
export function addressFrom(row) { return row.address || [row.street, row.city, row.state, row.zip].filter(Boolean).join(', ') }
export function isBusinessExpense(e) { return e.expense_type === 'business' || ['business', 'salon', 'supply', 'supplies', 'marketing', 'transportation', 'utility', 'rent', 'payroll'].includes(e.category) }
