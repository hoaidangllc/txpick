import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: { title: 'Bắt đầu rất đơn giản', sub: 'Mỗi ngày chỉ cần mở trang Hôm nay. Sau đó thêm nhắc việc, hóa đơn và chi tiêu khi cần.', s1: 'Tạo nhắc việc đầu tiên', s2: 'Thêm hóa đơn hằng tháng', s3: 'Thêm chi tiêu', go: 'Vào trang Hôm nay' },
  en: { title: 'Setup is simple', sub: 'Start with the Today page. Then add reminders, monthly bills, and expenses as needed.', s1: 'Add first reminder', s2: 'Add monthly bill', s3: 'Add expense', go: 'Go to Today' },
}

export default function Onboarding() {
  const { lang } = useLang()
  const c = copy[lang]
  return <div className="container-app py-10"><div className="card max-w-2xl mx-auto p-8 text-center"><h1 className="text-3xl font-extrabold text-ink-900">{c.title}</h1><p className="mt-2 text-ink-500">{c.sub}</p><div className="mt-6 grid sm:grid-cols-3 gap-3 text-left text-sm"><Step text={c.s1} /><Step text={c.s2} /><Step text={c.s3} /></div><Link to="/today" className="btn-primary mt-7">{c.go} <ArrowRight className="w-4 h-4" /></Link></div></div>
}
function Step({ text }) { return <div className="rounded-xl bg-ink-50 p-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600" /> {text}</div> }
