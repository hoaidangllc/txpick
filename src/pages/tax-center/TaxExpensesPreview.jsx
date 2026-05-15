import { fmtUSD } from '../../lib/lifeStore.js'

export default function TaxExpensesPreview({ c, rows }) {
  return (
    <section className="mt-5 card p-5">
      <h2 className="text-lg font-bold text-ink-900">{c.expenses}</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-sm text-ink-400">{c.emptyExpenses}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.slice(0, 12).map((e) => (
            <li key={e.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{e.title}</p>
                <p className="text-xs text-ink-500">{e.expense_date || e.date} • {e.category}</p>
              </div>
              <span className="font-bold text-ink-900">{fmtUSD(e.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
