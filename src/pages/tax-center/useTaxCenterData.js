import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { todayISO } from '../../lib/lifeStore.js'
import { currentYear } from './taxConstants.js'
import { isBusinessExpense, money, workerTotal } from './taxUtils.js'

export function useTaxCenterData(user) {
  const year = currentYear
  const [w2Rows, setW2Rows] = useState([])
  const [contractors, setContractors] = useState([])
  const [incomeRows, setIncomeRows] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const allWorkers = useMemo(() => [
    ...w2Rows.map((row) => ({ ...row, type: 'W2', tax_id: row.ssn || row.ssn_text || row.ssn_last4 })),
    ...contractors.map((row) => ({ ...row, type: '1099', tax_id: row.tin || row.tin_text || row.tin_last4 })),
  ].filter((row) => Number(row.tax_year || year) === year), [w2Rows, contractors, year])

  const yearIncomeRows = useMemo(() => incomeRows.filter((row) => String(row.record_date || '').startsWith(String(year))), [incomeRows, year])

  const businessExpenses = useMemo(() => expenses.filter((e) => {
    const d = String(e.expense_date || e.date || '')
    return d.startsWith(String(year)) && isBusinessExpense(e)
  }), [expenses, year])

  const totals = useMemo(() => {
    const workerPay = allWorkers.reduce((sum, row) => sum + workerTotal(row), 0)
    const income = yearIncomeRows.reduce((sum, row) => sum + money(row.amount), 0)
    const expense = businessExpenses.reduce((sum, row) => sum + money(row.amount), 0)
    return { workerPay, income, expense, net: income - expense - workerPay }
  }, [allWorkers, yearIncomeRows, businessExpenses])

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const [w2, c1099, income, exp] = await Promise.all([
        supabase.from('biz_workers_w2').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('biz_workers_1099').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('biz_income_records').select('*').eq('user_id', user.id).order('record_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('profile_id', user.id).order('expense_date', { ascending: false }),
      ])
      if (w2.error) throw w2.error
      if (c1099.error) throw c1099.error
      if (income.error) throw income.error
      if (exp.error) throw exp.error
      setW2Rows(w2.data || [])
      setContractors(c1099.data || [])
      setIncomeRows(income.data || [])
      setExpenses(exp.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load tax records')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadData() }, [loadData])

  async function addWorker(form) {
    const total = money(form.work_pay) + money(form.tips)
    const basePayload = {
      user_id: user.id,
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
      const payload = { ...basePayload, ssn: form.ssn || null, ssn_text: form.ssn || null, ssn_last4: String(form.ssn || '').slice(-4), wages: total }
      const { data, error: insertError } = await supabase.from('biz_workers_w2').insert(payload).select('*').single()
      if (insertError) throw insertError
      setW2Rows((prev) => [data, ...prev])
      return
    }

    const payload = { ...basePayload, tin: form.ssn || null, tin_text: form.ssn || null, tin_last4: String(form.ssn || '').slice(-4), payments: total }
    const { data, error: insertError } = await supabase.from('biz_workers_1099').insert(payload).select('*').single()
    if (insertError) throw insertError
    setContractors((prev) => [data, ...prev])
  }

  async function addIncome(form) {
    const payload = { user_id: user.id, source: form.source, category: form.category || 'salon_income', amount: money(form.amount), record_date: form.record_date || todayISO(), notes: form.notes || null }
    const { data, error: insertError } = await supabase.from('biz_income_records').insert(payload).select('*').single()
    if (insertError) throw insertError
    setIncomeRows((prev) => [data, ...prev])
  }

  async function removeWorker(row) {
    const table = row.type === 'W2' ? 'biz_workers_w2' : 'biz_workers_1099'
    const { error: deleteError } = await supabase.from(table).delete().eq('id', row.id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    if (row.type === 'W2') setW2Rows((prev) => prev.filter((x) => x.id !== row.id))
    else setContractors((prev) => prev.filter((x) => x.id !== row.id))
  }

  async function removeIncome(id) {
    const { error: deleteError } = await supabase.from('biz_income_records').delete().eq('id', id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    setIncomeRows((prev) => prev.filter((x) => x.id !== id))
  }

  return { year, loading, error, allWorkers, incomeRows, yearIncomeRows, businessExpenses, totals, addWorker, addIncome, removeWorker, removeIncome }
}
