import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { currentYear } from '../constants.js'
import { buildExpensePayload, buildIncomePayload, buildWorkerPayload } from '../utils/taxPayloads.js'
import { inTaxYear, isBusinessExpense, money, workerTotal } from '../utils/taxMath.js'

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

  const yearIncomeRows = useMemo(() => incomeRows.filter((row) => inTaxYear(row.record_date, year)), [incomeRows, year])

  const businessExpenses = useMemo(() => expenses.filter((expense) => {
    const date = expense.expense_date || expense.date
    return inTaxYear(date, year) && isBusinessExpense(expense)
  }), [expenses, year])

  const counts = useMemo(() => ({
    w2: allWorkers.filter((row) => row.type === 'W2').length,
    contractors1099: allWorkers.filter((row) => row.type === '1099').length,
    workers: allWorkers.length,
    income: yearIncomeRows.length,
    expenses: businessExpenses.length,
  }), [allWorkers, yearIncomeRows, businessExpenses])

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

  const addWorker = useCallback(async (form) => {
    const { table, payload } = buildWorkerPayload(user.id, form, year)
    const { data, error: insertError } = await supabase.from(table).insert(payload).select('*').single()
    if (insertError) throw insertError
    if (form.type === 'W2') setW2Rows((prev) => [data, ...prev])
    else setContractors((prev) => [data, ...prev])
  }, [user?.id, year])

  const removeWorker = useCallback(async (row) => {
    const table = row.type === 'W2' ? 'biz_workers_w2' : 'biz_workers_1099'
    const { error: deleteError } = await supabase.from(table).delete().eq('id', row.id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    if (row.type === 'W2') setW2Rows((prev) => prev.filter((x) => x.id !== row.id))
    else setContractors((prev) => prev.filter((x) => x.id !== row.id))
  }, [user?.id])

  const addIncome = useCallback(async (form) => {
    const payload = buildIncomePayload(user.id, form)
    const { data, error: insertError } = await supabase.from('biz_income_records').insert(payload).select('*').single()
    if (insertError) throw insertError
    setIncomeRows((prev) => [data, ...prev])
  }, [user?.id])

  const removeIncome = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('biz_income_records').delete().eq('id', id).eq('user_id', user.id)
    if (deleteError) throw deleteError
    setIncomeRows((prev) => prev.filter((x) => x.id !== id))
  }, [user?.id])



  const addBusinessExpense = useCallback(async (form) => {
    const payload = buildExpensePayload(user.id, form)
    const { data, error: insertError } = await supabase.from('expenses').insert(payload).select('*').single()
    if (insertError) throw insertError
    setExpenses((prev) => [data, ...prev])
  }, [user?.id])

  const removeBusinessExpense = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id).eq('profile_id', user.id)
    if (deleteError) throw deleteError
    setExpenses((prev) => prev.filter((x) => x.id !== id))
  }, [user?.id])

  return {
    year,
    loading,
    error,
    allWorkers,
    yearIncomeRows,
    incomeRows,
    businessExpenses,
    counts,
    totals,
    addWorker,
    removeWorker,
    addIncome,
    removeIncome,
    addBusinessExpense,
    removeBusinessExpense,
  }
}
