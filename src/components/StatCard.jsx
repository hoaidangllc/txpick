// Reusable headline stat tile used on dashboards.
export default function StatCard({ label, value, sublabel, tone = 'ink', icon: Icon }) {
  const toneCls = {
    ink: 'bg-white',
    brand: 'bg-brand-50',
    gold: 'bg-gold-500/10',
    rose: 'bg-rose-50',
  }[tone]
  const valueCls = {
    ink: 'text-ink-900',
    brand: 'text-brand-700',
    gold: 'text-gold-600',
    rose: 'text-rose-700',
  }[tone]
  return (
    <div className={`rounded-2xl border border-ink-100 p-5 ${toneCls}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-ink-400" />}
      </div>
      <p className={`mt-2 text-2xl sm:text-3xl font-extrabold ${valueCls}`}>{value}</p>
      {sublabel && <p className="text-xs text-ink-500 mt-1">{sublabel}</p>}
    </div>
  )
}
