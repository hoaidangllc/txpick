import { CheckCircle2, FileSpreadsheet, FileText, ShieldCheck, UsersRound } from 'lucide-react'

const iconMap = {
  workers: UsersRound,
  exports: FileSpreadsheet,
  forms: FileText,
  safety: ShieldCheck,
}

export default function TaxPrepGuide({ labels, counts }) {
  const cards = labels.prepCards.map((card) => ({ ...card, Icon: iconMap[card.icon] || CheckCircle2 }))

  return (
    <section className="mt-5 grid gap-3 lg:grid-cols-4">
      {cards.map(({ Icon, title, body, stat }) => (
        <div key={title} className="card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-ink-900 leading-tight">{title}</h2>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">{body}</p>
              {stat && <p className="mt-3 text-xs font-bold text-brand-700">{stat(counts)}</p>}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
