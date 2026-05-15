import { Plus, Trash2 } from 'lucide-react'
import { fmtUSD } from '../../lib/lifeStore.js'

export default function TaxIncomeCard({ c, rows, loading, onAdd, onRemove }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{c.income}</h2>
        <button className="btn-primary !py-2 text-sm" onClick={onAdd}><Plus className="w-4 h-4" /> {c.addIncome}</button>
      </div>
      {loading ? <p className="py-10 text-center text-sm text-ink-400">Loading…</p> : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">{c.emptyIncome}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.map((row) => (
            <li key={row.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{row.source}</p>
                <p className="text-xs text-ink-500">{row.record_date} • {c.incomeCategories[row.category] || row.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink-900">{fmtUSD(row.amount)}</span>
                <button className="text-ink-300 hover:text-rose-600" onClick={() => onRemove(row.id)} aria-label={c.delete}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
