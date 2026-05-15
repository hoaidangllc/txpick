import { fmtUSD } from '../../../lib/lifeStore.js'

export default function ExpensesCard({ labels, rows }) {
  return (
    <section className="mt-5 card p-5">
      <h2 className="text-lg font-bold text-ink-900">{labels.expenses}</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-sm text-ink-400">{labels.emptyExpenses}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.slice(0, 12).map((expense) => (
            <li key={expense.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{expense.title}</p>
                <p className="text-xs text-ink-500">{expense.expense_date || expense.date} • {expense.category}</p>
              </div>
              <span className="font-bold text-ink-900">{fmtUSD(expense.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
