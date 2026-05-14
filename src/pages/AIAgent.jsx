import { useMemo, useRef, useState } from 'react'
import { Sparkles, Camera, Send, AlertTriangle, Crown, Lightbulb, CheckCircle2 } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useLocalStore, fmtUSD, inCurrentMonth } from '../lib/useLocalStore.js'
import { aiChat, aiReadReceipt, OPENAI_CONFIGURED } from '../lib/openai.js'

export default function AIAgent() {
  const { t, lang } = useLang()
  const [pro, proApi] = useLocalStore('txpick_pro', false)
  const [expenses, exApi] = useLocalStore('txpick_biz_expenses', [])

  if (!pro) return <Paywall onUpgrade={() => proApi.setValue(true)} />

  return (
    <div className="container-app py-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-ink-900">
            <Sparkles className="w-7 h-7 text-gold-500" /> {t.ai.title}
          </h1>
          <p className="text-ink-500 mt-1">{t.ai.proSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-gold-500/10 text-gold-600"><Crown className="w-3 h-3" /> Pro</span>
          <button onClick={() => proApi.setValue(false)} className="btn-ghost text-xs">Downgrade</button>
        </div>
      </header>

      {!OPENAI_CONFIGURED && (
        <div className="mt-4 p-4 rounded-xl bg-gold-500/10 text-gold-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Demo mode</p>
            <p>Set VITE_OPENAI_API_KEY in .env to enable live AI. In production, route calls through a Supabase Edge Function so your key is never exposed.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <ReceiptScanner onSaveExpense={(d) => exApi.add(d)} />
        <SmartAlerts expenses={expenses} />
        <ChatPanel lang={lang} />
        <TaxTips lang={lang} />
      </div>
    </div>
  )
}

function Paywall({ onUpgrade }) {
  const { t } = useLang()
  return (
    <div className="container-app py-10 sm:py-16">
      <div className="card max-w-2xl mx-auto p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-gold-500/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-600 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="badge bg-gold-500/10 text-gold-600 mb-3"><Crown className="w-3 h-3" /> {t.ai.pro}</span>
          <h1 className="text-3xl font-extrabold text-ink-900">{t.ai.title}</h1>
          <p className="mt-2 text-ink-500">{t.ai.proSub}</p>

          <ul className="mt-6 max-w-md mx-auto text-left space-y-2 text-sm">
            {[t.ai.scanReceipt, t.ai.chat, t.ai.alerts].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> {f}
              </li>
            ))}
          </ul>

          <button onClick={onUpgrade} className="btn-primary mt-7 mx-auto">
            <Crown className="w-4 h-4" /> {t.ai.upgrade} — $9.99/mo
          </button>
          <p className="mt-2 text-xs text-ink-400">Demo: nút này mở khóa module local. Wire Stripe cho production.</p>
        </div>
      </div>
    </div>
  )
}

function ReceiptScanner({ onSaveExpense }) {
  const { t } = useLang()
  const fileRef = useRef(null)
  const [parsed, setParsed] = useState(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      setPreview(reader.result)
      setBusy(true)
      const data = await aiReadReceipt(reader.result)
      setBusy(false)
      setParsed(data)
    }
    reader.readAsDataURL(file)
  }

  const saveExpense = () => {
    if (!parsed) return
    onSaveExpense({
      amount: Number(parsed.total || 0),
      category: parsed.category || 'other',
      date: parsed.date || new Date().toISOString().slice(0, 10),
      note: parsed.vendor || 'AI receipt',
    })
    setParsed(null)
    setPreview(null)
  }

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-bold text-ink-900">
        <Camera className="w-4 h-4 text-brand-600" /> {t.ai.scanReceipt}
      </h2>
      <p className="text-sm text-ink-500 mt-1">{t.ai.scanHint}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="mt-4 flex gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn-secondary">
          <Camera className="w-4 h-4" /> {t.ai.scanReceipt}
        </button>
      </div>

      {preview && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <img src={preview} alt="receipt" className="rounded-xl border border-ink-100 max-h-60 object-contain w-full bg-ink-50" />
          <div className="text-sm">
            {busy ? (
              <p className="animate-pulse-soft text-ink-500">Reading receipt…</p>
            ) : parsed ? (
              <div className="space-y-1.5">
                <Row k="Vendor" v={parsed.vendor || '—'} />
                <Row k="Date" v={parsed.date || '—'} />
                <Row k="Category" v={parsed.category || 'other'} />
                <Row k="Total" v={fmtUSD(parsed.total || 0)} bold />
                {parsed._demo && <p className="text-xs text-gold-700 mt-2">Demo data shown.</p>}
                <button onClick={saveExpense} className="btn-primary mt-3 w-full">
                  Save as expense
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ k, v, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{k}</span>
      <span className={bold ? 'font-bold text-ink-900' : 'text-ink-900'}>{v}</span>
    </div>
  )
}

function SmartAlerts({ expenses }) {
  const { t } = useLang()
  const alerts = useMemo(() => buildAlerts(expenses), [expenses])
  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-bold text-ink-900">
        <AlertTriangle className="w-4 h-4 text-gold-600" /> {t.ai.alerts}
      </h2>
      <ul className="mt-3 space-y-2">
        {alerts.length === 0 ? (
          <li className="text-sm text-ink-400 py-4 text-center">No alerts right now.</li>
        ) : alerts.map((a, i) => {
          const Icon = a.icon
          return (
            <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-ink-50">
              <Icon className={'w-4 h-4 mt-0.5 flex-shrink-0 ' + a.tone} />
              <div className="text-sm">
                <p className="font-semibold text-ink-900">{a.title}</p>
                <p className="text-ink-500 text-xs">{a.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function buildAlerts(expenses) {
  const out = []
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sumBy = (predicate) => expenses.filter(predicate).reduce((s, e) => s + Number(e.amount || 0), 0)
  const thisMonthSupply = sumBy((e) => e.category === 'supply' && inCurrentMonth(e.date))
  const lastMonthSupply = sumBy((e) => {
    if (e.category !== 'supply') return false
    const d = new Date(e.date)
    return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth()
  })
  if (lastMonthSupply && thisMonthSupply > lastMonthSupply * 1.15) {
    const pct = Math.round(((thisMonthSupply - lastMonthSupply) / lastMonthSupply) * 100)
    out.push({
      icon: AlertTriangle, tone: 'text-rose-600',
      title: 'Chi phí vật tư tăng ' + pct + '% / Supply costs up ' + pct + '%',
      body: fmtUSD(thisMonthSupply) + ' this month vs ' + fmtUSD(lastMonthSupply) + ' last month.',
    })
  }
  out.push({
    icon: Lightbulb, tone: 'text-gold-600',
    title: 'Đừng quên ghi mileage / Don\'t forget mileage',
    body: 'Mileage xe đi làm có thể khấu trừ — ghi lại đều đặn.',
  })
  return out
}

function ChatPanel({ lang }) {
  const { t } = useLang()
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: lang === 'vi'
        ? 'Chào bạn! Mình là trợ lý AI của TxPick. Hỏi gì cũng được — bằng tiếng Việt hay tiếng Anh.'
        : 'Hi! I am the TxPick AI assistant. Ask me anything in Vietnamese or English.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    const reply = await aiChat([
      {
        role: 'system',
        content:
          'You are TxPick, a bilingual (English & Vietnamese) finance assistant for Vietnamese-Americans ' +
          'who run small businesses (often nail salons, restaurants, auto shops). ' +
          'Answer in the language the user wrote in. Be concise and concrete. ' +
          'For tax questions, remind them you are not a CPA.',
      },
      ...next,
    ])
    setMessages([...next, reply])
    setBusy(false)
  }

  return (
    <div className="card p-5 lg:col-span-2 flex flex-col h-[460px]">
      <h2 className="flex items-center gap-2 font-bold text-ink-900">
        <Sparkles className="w-4 h-4 text-brand-600" /> {t.ai.chat}
      </h2>

      <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ' +
              (m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-900')}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-ink-100 text-ink-500 rounded-2xl px-4 py-2.5 text-sm animate-pulse-soft">…</div>
          </div>
        )}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder={lang === 'vi' ? 'Hỏi gì cũng được…' : 'Ask anything…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy || !input.trim()}>
          <Send className="w-4 h-4" /> {t.ai.send}
        </button>
      </form>
    </div>
  )
}

function TaxTips({ lang }) {
  const tips = lang === 'vi' ? [
    'Mileage xe đi tiệm: 67¢/dặm (2024) — ghi lại đều đặn.',
    'Mua sắm vật tư trên $2,500 nên ghi nhận khấu hao thay vì chi phí.',
    'Hợp đồng thợ trả từ $600 → bắt buộc gửi 1099-NEC.',
    'Bảo hiểm sức khỏe của bản thân có thể khấu trừ ở Schedule 1.',
  ] : [
    'Business mileage in 2024 is 67¢/mile — log it weekly.',
    'Supply purchases over $2,500 may need to be depreciated instead of expensed.',
    'Contractor pay ≥ $600/year → 1099-NEC required.',
    'Self-employed health insurance is often deductible on Schedule 1.',
  ]
  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-bold text-ink-900">
        <Lightbulb className="w-4 h-4 text-gold-600" /> {lang === 'vi' ? 'Gợi ý thuế' : 'Tax tips'}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-ink-700">
            <CheckCircle2 className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /> {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
