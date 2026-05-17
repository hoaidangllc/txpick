import { Plus, Trash2 } from 'lucide-react'
import { fmtUSD } from '../../../lib/lifeStore.js'

export default function ExpensesCard({ labels, rows, onAdd, onRemove }) {
  return (
    <section className="mt-5 card p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-ink-900">{labels.expenses}</h2>
          <p className="text-xs text-ink-500 mt-0.5">{labels.expenseSub}</p>
        </div>
        <button className="btn-primary !py-2 text-sm" onClick={onAdd}><Plus className="w-4 h-4" /> {labels.addExpense}</button>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-sm text-ink-400">{labels.emptyExpenses}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.slice(0, 30).map((expense) => (
            <li key={expense.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 truncate">{expense.title}</p>
                <p className="text-xs text-ink-500">{expense.expense_date || expense.date} • {labels.expenseCategories[expense.category] || expense.category}</p>
                {(expense.notes || expense.note) && <p className="text-xs text-ink-400 truncate max-w-[420px]">{expense.notes || expense.note}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-ink-900">{fmtUSD(expense.amount)}</span>
                {onRemove && <button className="text-ink-300 hover:text-rose-600" onClick={() => onRemove(expense.id)} aria-label={labels.delete}><Trash2 className="w-4 h-4" /></button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
