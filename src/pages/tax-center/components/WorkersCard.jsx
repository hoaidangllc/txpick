import { Plus, Trash2 } from 'lucide-react'
import { fmtUSD } from '../../../lib/lifeStore.js'
import { addressFrom, workerTotal } from '../utils/taxMath.js'

export default function WorkersCard({ labels, rows, loading, onAdd, onRemove }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{labels.workers}</h2>
        <button className="btn-primary !py-2 text-sm" onClick={onAdd}><Plus className="w-4 h-4" /> {labels.addWorker}</button>
      </div>
      {loading ? <p className="py-10 text-center text-sm text-ink-400">Loading…</p> : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">{labels.emptyWorkers}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {rows.map((row) => (
            <li key={`${row.type}-${row.id}`} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{row.name}</p>
                <p className="text-xs text-ink-500">{row.type} • {labels.workPay}: {fmtUSD(row.work_pay ?? row.wages ?? row.payments)} • {labels.tips}: {fmtUSD(row.tips)}</p>
                <p className="text-xs text-ink-400 truncate max-w-[320px]">{addressFrom(row) || '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink-900">{fmtUSD(workerTotal(row))}</span>
                <button className="text-ink-300 hover:text-rose-600" onClick={() => onRemove(row)} aria-label={labels.delete}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
