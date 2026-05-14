import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Onboarding() {
  return <div className="container-app py-10"><div className="card max-w-2xl mx-auto p-8 text-center"><h1 className="text-3xl font-extrabold text-ink-900">Setup is simple</h1><p className="mt-2 text-ink-500">Bắt đầu bằng Today page. Sau đó thêm reminder, expense và bill hằng tháng.</p><div className="mt-6 grid sm:grid-cols-3 gap-3 text-left text-sm"><Step text="Add first reminder" /><Step text="Add monthly bill" /><Step text="Add expense" /></div><Link to="/today" className="btn-primary mt-7">Go to Today <ArrowRight className="w-4 h-4" /></Link></div></div>
}
function Step({ text }) { return <div className="rounded-xl bg-ink-50 p-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600" /> {text}</div> }
