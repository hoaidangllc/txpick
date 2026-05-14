import { useMemo, useState } from 'react'
import { Download, FileText, Users, UserCheck, Building2 } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLocalStore, fmtUSD } from '../lib/useLocalStore.js'

const SCHED_C_LINES = [
  { line: '1',  key: 'grossReceipts',  pulls: ['__income'] },
  { line: '2',  key: 'returns',        pulls: [] },
  { line: '4',  key: 'costGoods',      pulls: [] },
  { line: '8',  key: 'advertising',    pulls: ['marketing'] },
  { line: '9',  key: 'carExpenses',    pulls: [] },
  { line: '11', key: 'contractLabor',  pulls: ['__1099'] },
  { line: '13', key: 'depreciation',   pulls: [] },
  { line: '15', key: 'insurance',      pulls: [] },
  { line: '20', key: 'rentLease',      pulls: ['rent'] },
  { line: '21', key: 'repairs',        pulls: [] },
  { line: '22', key: 'supplies',       pulls: ['supply'] },
  { line: '23', key: 'taxesLicenses',  pulls: [] },
  { line: '24', key: 'travel',         pulls: [] },
  { line: '25', key: 'utilities',      pulls: ['utilities'] },
  { line: '26', key: 'wages',          pulls: ['__w2'] },
  { line: '27a', key: 'otherExpenses', pulls: ['food', 'equipment', 'other'] },
]

export default function Tax() {
  const { t } = useLang()
  const { profile } = useAuth()
  const [expenses] = useLocalStore('txpick_biz_expenses', [])
  const [workers] = useLocalStore('txpick_biz_1099', [])
  const [employees] = useLocalStore('txpick_biz_w2', [])
  const [income] = useLocalStore('txpick_biz_income_estimate', 12840)
  const [businessInfo] = useLocalStore('txpick_business_info', {
    name: profile?.business_name || 'My Business',
    ein: '',
    street: '', city: '', state: '', zip: '',
  })
  const [year, setYear] = useState(new Date().getFullYear())
  const [tab, setTab] = useState('scheduleC')

  const byCategory = useMemo(() => {
    const totals = {}
    for (const e of expenses) {
      const y = new Date(e.date || e.createdAt || Date.now()).getFullYear()
      if (y !== year) continue
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0)
    }
    return totals
  }, [expenses, year])

  const contractLabor = workers.reduce((s, w) => s + Number(w.amount || 0), 0)
  const wagesPaid = employees.reduce((s, e) => s + Number(e.wages || 0), 0)

  const lineAmount = (pulls) => {
    let total = 0
    for (const p of pulls) {
      if (p === '__income') total += income
      else if (p === '__1099') total += contractLabor
      else if (p === '__w2') total += wagesPaid
      else total += byCategory[p] || 0
    }
    return total
  }

  const totalExpenses = SCHED_C_LINES
    .filter((l) => l.key !== 'grossReceipts' && l.key !== 'returns')
    .reduce((s, l) => s + lineAmount(l.pulls), 0)
  const netProfit = income - totalExpenses

  const exportPdf = () =>
    exportFullTaxPdf({
      year, lines: SCHED_C_LINES, lineAmount, t, totalExpenses, netProfit, income,
      workers, employees, businessInfo,
    })

  return (
    <div className="container-app py-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">{t.tax.title}</h1>
          <p className="text-ink-500 mt-1">{t.tax.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !py-2 !w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[0, 1, 2, 3].map((d) => {
              const y = new Date().getFullYear() - d
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
          <button onClick={exportPdf} className="btn-primary">
            <Download className="w-4 h-4" /> Xuất PDF / Export
          </button>
        </div>
      </header>

      <div className="mt-6 inline-flex bg-white border border-ink-200 rounded-xl p-1 text-sm font-semibold overflow-x-auto">
        <TabButton active={tab === 'scheduleC'} onClick={() => setTab('scheduleC')} icon={FileText}>
          {t.tax.scheduleC}
        </TabButton>
        <TabButton active={tab === 'form1099'} onClick={() => setTab('form1099')} icon={Users}>
          {t.tax.form1099}
        </TabButton>
        <TabButton active={tab === 'formW2'} onClick={() => setTab('formW2')} icon={UserCheck}>
          Form W-2
        </TabButton>
        <TabButton active={tab === 'business'} onClick={() => setTab('business')} icon={Building2}>
          Business Info
        </TabButton>
      </div>

      {tab === 'scheduleC' && (
        <section className="mt-5 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3 w-16">Line</th>
                  <th className="text-left px-4 py-3">English / Tiếng Việt</th>
                  <th className="text-right px-4 py-3">{year} {t.common.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {SCHED_C_LINES.map((l) => {
                  const amt = lineAmount(l.pulls)
                  return (
                    <tr key={l.line} className={amt ? '' : 'opacity-60'}>
                      <td className="px-4 py-3 font-mono text-ink-500">{l.line}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{t.tax.lines[l.key]}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtUSD(amt)}</td>
                    </tr>
                  )
                })}
                <tr className="bg-ink-50 font-bold">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Total expenses</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(totalExpenses)}</td>
                </tr>
                <tr className={'font-bold ' + (netProfit >= 0 ? 'text-brand-700' : 'text-rose-700')}>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Net profit / loss</td>
                  <td className="px-4 py-3 text-right">{fmtUSD(netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'form1099' && (
        <Form1099Preview workers={workers} year={year} businessInfo={businessInfo} />
      )}

      {tab === 'formW2' && (
        <FormW2Preview employees={employees} year={year} businessInfo={businessInfo} />
      )}

      {tab === 'business' && (
        <BusinessInfoEditor />
      )}

      <p className="mt-4 text-xs text-ink-400">
        TxPick không phải là kế toán. Vui lòng kiểm tra lại với chuyên gia thuế trước khi nộp.
        <br />
        TxPick is not a CPA. Always review with a tax professional before filing.
      </p>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={'px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap ' +
        (active ? 'bg-brand-50 text-brand-700' : 'text-ink-600')}
    >
      <Icon className="w-4 h-4" /> {children}
    </button>
  )
}

function Form1099Preview({ workers, year, businessInfo }) {
  const required = workers.filter((w) => Number(w.amount) >= 600)
  const totalPaid = workers.reduce((s, w) => s + Number(w.amount || 0), 0)

  return (
    <section className="mt-5 space-y-4">
      <div className="card p-5">
        <h2 className="text-lg font-bold text-ink-900">Form 1099-NEC — {year}</h2>
        <p className="text-sm text-ink-500 mt-1">
          Gửi 1099-NEC cho thợ được trả từ $600 trong năm.
          <span className="block text-ink-400">Issue 1099-NEC to any contractor paid $600+ during the year.</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="badge bg-brand-50 text-brand-700">{required.length} required</span>
          <span className="badge bg-ink-100 text-ink-700">Total paid: {fmtUSD(totalPaid)}</span>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">
          Chưa có thợ 1099. Thêm trong dashboard Business.
        </div>
      ) : (
        workers.map((w) => (
          <Form1099Card key={w.id} worker={w} year={year} payer={businessInfo} required={Number(w.amount) >= 600} />
        ))
      )}
    </section>
  )
}

function Form1099Card({ worker, year, payer, required }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 bg-ink-50 border-b border-ink-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <Users className="w-4 h-4 text-brand-600" />
          {worker.name} — Form 1099-NEC ({year})
        </div>
        {required
          ? <span className="badge bg-brand-50 text-brand-700">Required</span>
          : <span className="badge bg-ink-100 text-ink-500">Below $600 threshold</span>}
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Payer / Bên trả</p>
          <p className="font-semibold">{payer?.name || '—'}</p>
          {payer?.ein && <p className="font-mono text-xs text-ink-500">EIN: {payer.ein}</p>}
          {[payer?.street, [payer?.city, payer?.state].filter(Boolean).join(', '), payer?.zip].filter(Boolean).join(' • ') && (
            <p className="text-ink-500 text-xs mt-0.5">
              {payer?.street} {payer?.city} {payer?.state} {payer?.zip}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Recipient / Bên nhận</p>
          <p className="font-semibold">{worker.name}</p>
          {worker.ssn && <p className="font-mono text-xs text-ink-500">SSN: •••-••-{worker.ssn.slice(-4)}</p>}
          <p className="text-ink-500 text-xs mt-0.5">
            {[worker.street, [worker.city, worker.state].filter(Boolean).join(', '), worker.zip].filter(Boolean).join(' • ') || '—'}
          </p>
        </div>
        <div className="sm:col-span-2 border-t border-ink-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-500">Box 1 — Nonemployee compensation</p>
              <p className="font-bold text-lg">{fmtUSD(worker.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Box 4 — Federal income tax withheld</p>
              <p className="font-bold text-lg">$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormW2Preview({ employees, year, businessInfo }) {
  const totalWages = employees.reduce((s, e) => s + Number(e.wages || 0), 0)
  return (
    <section className="mt-5 space-y-4">
      <div className="card p-5">
        <h2 className="text-lg font-bold text-ink-900">Form W-2 — {year}</h2>
        <p className="text-sm text-ink-500 mt-1">
          Gửi W-2 cho mỗi nhân viên ăn lương (có trừ thuế).
          <span className="block text-ink-400">Issue a W-2 to every salaried employee with tax withheld.</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="badge bg-brand-50 text-brand-700">{employees.length} employees</span>
          <span className="badge bg-ink-100 text-ink-700">Total wages: {fmtUSD(totalWages)}</span>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">
          Chưa có nhân viên W-2. Thêm trong dashboard Business.
        </div>
      ) : (
        employees.map((e) => (
          <FormW2Card key={e.id} emp={e} year={year} employer={businessInfo} />
        ))
      )}
    </section>
  )
}

function FormW2Card({ emp, year, employer }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 bg-ink-50 border-b border-ink-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <UserCheck className="w-4 h-4 text-brand-600" />
          {emp.name} — Form W-2 ({year})
        </div>
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Employer / Chủ tiệm</p>
          <p className="font-semibold">{employer?.name || '—'}</p>
          {employer?.ein && <p className="font-mono text-xs text-ink-500">EIN: {employer.ein}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Employee / Nhân viên</p>
          <p className="font-semibold">{emp.name}</p>
          {emp.ssn && <p className="font-mono text-xs text-ink-500">SSN: •••-••-{emp.ssn.slice(-4)}</p>}
        </div>
        <div className="sm:col-span-2 border-t border-ink-100 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <W2Box num="1" label="Wages, tips, other comp." amount={emp.wages} />
          <W2Box num="2" label="Federal income tax withheld" amount={emp.fedWithholding} />
          <W2Box num="3" label="Social Security wages" amount={emp.wages} />
          <W2Box num="4" label="Social Security tax withheld" amount={emp.ssWithholding} />
          <W2Box num="5" label="Medicare wages and tips" amount={emp.wages} />
          <W2Box num="6" label="Medicare tax withheld" amount={emp.medicareWithholding} />
        </div>
      </div>
    </div>
  )
}

function W2Box({ num, label, amount }) {
  return (
    <div className="border border-ink-100 rounded-lg p-2.5">
      <p className="text-[10px] text-ink-500 font-mono">Box {num}</p>
      <p className="text-[11px] text-ink-600 leading-tight">{label}</p>
      <p className="font-bold mt-1">{fmtUSD(amount || 0)}</p>
    </div>
  )
}

function BusinessInfoEditor() {
  const [info, infoApi] = useLocalStore('txpick_business_info', {
    name: '', ein: '', street: '', city: '', state: '', zip: '',
  })
  const [form, setForm] = useState(info)
  const [saved, setSaved] = useState(false)
  const save = (e) => {
    e.preventDefault()
    infoApi.setValue(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <section className="mt-5 card p-5">
      <h2 className="text-lg font-bold text-ink-900">Thông tin tiệm / Business info</h2>
      <p className="text-sm text-ink-500 mt-1">
        Dùng cho phần Payer/Employer trên 1099-NEC và W-2.
      </p>
      <form onSubmit={save} className="mt-4 grid sm:grid-cols-2 gap-3 max-w-2xl">
        <div className="sm:col-span-2">
          <label className="label">Tên tiệm / Business name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">EIN</label>
          <input className="input" value={form.ein} placeholder="XX-XXXXXXX"
            onChange={(e) => setForm({ ...form, ein: e.target.value })} />
        </div>
        <div></div>
        <div className="sm:col-span-2">
          <label className="label">Street</label>
          <input className="input" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">State</label>
            <input className="input" maxLength="2" value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="label">ZIP</label>
            <input className="input" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">Lưu / Save</button>
          {saved && <span className="text-sm text-brand-700">Đã lưu ✓</span>}
        </div>
      </form>
    </section>
  )
}

// =====================================================================
// PDF export — multi-page tax packet (Schedule C + 1099-NEC + W-2 forms)
// =====================================================================
function exportFullTaxPdf(ctx) {
  const { year, lines, lineAmount, t, totalExpenses, netProfit, workers, employees, businessInfo } = ctx

  const schedC = lines.map((l) => `
    <tr>
      <td class="line">${l.line}</td>
      <td>${t.tax.lines[l.key]}</td>
      <td class="amt">$${lineAmount(l.pulls).toFixed(2)}</td>
    </tr>
  `).join('')

  const schedCPage = `
    <section class="page">
      <h1>Schedule C (Form 1040) — ${year}</h1>
      <p class="sub">Profit or Loss From Business · Lợi nhuận / Lỗ từ kinh doanh</p>
      <div class="biz">
        <p><strong>${esc(businessInfo?.name) || 'My Business'}</strong></p>
        <p class="small">${esc(businessInfo?.ein ? 'EIN: ' + businessInfo.ein : '')}</p>
        <p class="small">${esc([businessInfo?.street, businessInfo?.city, businessInfo?.state, businessInfo?.zip].filter(Boolean).join(' · '))}</p>
      </div>
      <table>
        <thead><tr><th class="line">Line</th><th>Item</th><th class="amt">Amount</th></tr></thead>
        <tbody>
          ${schedC}
          <tr class="total"><td></td><td>Total expenses</td><td class="amt">$${totalExpenses.toFixed(2)}</td></tr>
          <tr class="net"><td></td><td>Net profit / loss</td><td class="amt">$${netProfit.toFixed(2)}</td></tr>
        </tbody>
      </table>
    </section>
  `

  const ten99 = workers.filter((w) => Number(w.amount) > 0).map((w) => render1099(w, year, businessInfo)).join('')
  const w2 = employees.map((e) => renderW2(e, year, businessInfo)).join('')

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>TxPick — ${year} Tax Packet</title>
<style>
  @page { size: letter; margin: 0.5in; }
  * { box-sizing: border-box; }
  body { font: 13px/1.45 -apple-system, system-ui, Inter, sans-serif; color: #0f172a; margin: 0; }
  .page { page-break-after: always; padding: 0.25in 0; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 0 0 4px; }
  p.sub { color: #64748b; margin: 0 0 16px; }
  .small { color: #64748b; font-size: 11px; }
  .biz { margin-bottom: 16px; padding: 10px 12px; background: #f8fafc; border-radius: 6px; }
  .biz p { margin: 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; }
  td.line { font-family: ui-monospace, monospace; color: #64748b; width: 60px; }
  td.amt, th.amt { text-align: right; font-variant-numeric: tabular-nums; }
  tr.total td { font-weight: 700; border-top: 2px solid #0f172a; }
  tr.net td { font-weight: 700; color: #047857; }

  /* 1099 form layout */
  .form { border: 2px solid #0f172a; padding: 14px; margin-bottom: 14px; }
  .form .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; }
  .form .head h2 { font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; }
  .form .head .yr { font-weight: 700; }
  .form .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form .field { border: 1px solid #94a3b8; padding: 6px 8px; min-height: 50px; }
  .form .field .lbl { font-size: 9px; text-transform: uppercase; color: #475569; letter-spacing: 0.04em; }
  .form .field .val { font-weight: 600; font-size: 13px; margin-top: 2px; }
  .form .boxes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
  .form .box { border: 1px solid #94a3b8; padding: 6px 8px; min-height: 56px; }
  .form .box .lbl { font-size: 9px; text-transform: uppercase; color: #475569; }
  .form .box .val { font-weight: 700; font-size: 14px; margin-top: 6px; text-align: right; font-variant-numeric: tabular-nums; }
  .form .stamp { display: inline-block; font-size: 9px; padding: 2px 6px; border-radius: 999px; background: #ecfdf5; color: #047857; font-weight: 700; }
  .form .stamp.no { background: #f1f5f9; color: #64748b; }
  .disclaimer { font-size: 10px; color: #64748b; margin-top: 28px; padding-top: 8px; border-top: 1px dashed #cbd5e1; }
</style></head>
<body>
  ${schedCPage}
  ${workers.length > 0 ? `
    <section class="page">
      <h1>Form 1099-NEC — ${year}</h1>
      <p class="sub">Nonemployee Compensation · Thanh toán cho thợ hợp đồng</p>
      ${ten99}
    </section>
  ` : ''}
  ${employees.length > 0 ? `
    <section class="page">
      <h1>Form W-2 — ${year}</h1>
      <p class="sub">Wage and Tax Statement · Lương và thuế</p>
      ${w2}
    </section>
  ` : ''}
  <p class="disclaimer">
    Bản tóm tắt được tạo bởi TxPick từ dữ liệu bạn nhập. Không thay thế cho tư vấn của kế toán chuyên nghiệp.
    Form layouts shown for record-keeping only — file with the IRS using their official forms.
  </p>
  <script>window.onload = () => setTimeout(() => window.print(), 300)</script>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) return alert('Vui lòng cho phép popup để xuất PDF / Please allow popups to export.')
  w.document.write(html)
  w.document.close()
}

function render1099(worker, year, payer) {
  const required = Number(worker.amount) >= 600
  const recipAddr = [worker.street, [worker.city, worker.state].filter(Boolean).join(', '), worker.zip].filter(Boolean).join(' · ') || '—'
  const payerAddr = [payer?.street, [payer?.city, payer?.state].filter(Boolean).join(', '), payer?.zip].filter(Boolean).join(' · ') || '—'
  return `
    <div class="form">
      <div class="head">
        <h2>Form 1099-NEC <span style="font-weight:400;color:#64748b">— Copy B (Recipient)</span></h2>
        <div class="yr">${year} · <span class="stamp ${required ? '' : 'no'}">${required ? 'Required' : 'Below $600'}</span></div>
      </div>
      <div class="row2">
        <div class="field">
          <div class="lbl">Payer · Bên trả (Name, address, EIN)</div>
          <div class="val">${esc(payer?.name) || '—'}</div>
          <div class="small">${esc(payer?.ein ? 'EIN: ' + payer.ein : '')}</div>
          <div class="small">${esc(payerAddr)}</div>
        </div>
        <div class="field">
          <div class="lbl">Recipient · Bên nhận</div>
          <div class="val">${esc(worker.name)}</div>
          <div class="small">${worker.ssn ? 'SSN: •••-••-' + esc(worker.ssn.slice(-4)) : 'SSN missing'}</div>
          <div class="small">${esc(recipAddr)}</div>
        </div>
      </div>
      <div class="boxes">
        <div class="box"><div class="lbl">Box 1 · Nonemployee compensation</div><div class="val">$${Number(worker.amount || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 4 · Federal income tax withheld</div><div class="val">$0.00</div></div>
        <div class="box"><div class="lbl">Box 5 · State tax withheld</div><div class="val">$0.00</div></div>
        <div class="box"><div class="lbl">Box 6 · State / Payer's state no.</div><div class="val">${esc(payer?.state) || '—'}</div></div>
      </div>
    </div>
  `
}

function renderW2(emp, year, employer) {
  return `
    <div class="form">
      <div class="head">
        <h2>Form W-2 <span style="font-weight:400;color:#64748b">— Copy B (Employee)</span></h2>
        <div class="yr">${year}</div>
      </div>
      <div class="row2">
        <div class="field">
          <div class="lbl">Employer · Chủ tiệm</div>
          <div class="val">${esc(employer?.name) || '—'}</div>
          <div class="small">${esc(employer?.ein ? 'EIN: ' + employer.ein : '')}</div>
        </div>
        <div class="field">
          <div class="lbl">Employee · Nhân viên</div>
          <div class="val">${esc(emp.name)}</div>
          <div class="small">${emp.ssn ? 'SSN: •••-••-' + esc(emp.ssn.slice(-4)) : 'SSN missing'}</div>
        </div>
      </div>
      <div class="boxes">
        <div class="box"><div class="lbl">Box 1 · Wages, tips, other comp.</div><div class="val">$${Number(emp.wages || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 2 · Federal income tax w/h</div><div class="val">$${Number(emp.fedWithholding || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 3 · Social Security wages</div><div class="val">$${Number(emp.wages || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 4 · Social Security tax w/h</div><div class="val">$${Number(emp.ssWithholding || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 5 · Medicare wages and tips</div><div class="val">$${Number(emp.wages || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 6 · Medicare tax w/h</div><div class="val">$${Number(emp.medicareWithholding || 0).toFixed(2)}</div></div>
        <div class="box"><div class="lbl">Box 15 · State</div><div class="val">${esc(employer?.state) || '—'}</div></div>
        <div class="box"><div class="lbl">Box 17 · State income tax</div><div class="val">$0.00</div></div>
      </div>
    </div>
  `
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
