import { useState, useEffect, useCallback } from 'react'
import { Percent, Plus, Pencil, Trash2, Calculator, History, UserCircle2, CheckCircle2, Circle, Coins } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import {
  getProfiles, upsertProfile, deleteProfile,
  saveHistory, getHistory, deleteHistoryEntry,
} from '../lib/profitSplitDb.js'
import HuiTab from './HuiTab.jsx'

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: 'VND', symbol: '₫', locale: 'vi-VN', decimals: 0 },
  { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
]

function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

function fmt(value, currencyCode) {
  const c = getCurrency(currencyCode)
  return new Intl.NumberFormat(c.locale, {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  }).format(value ?? 0)
}

function calcProfit({ quantity, base_rate, selling_rate, partner_percent, commission_percent }) {
  const q = parseFloat(quantity) || 0
  const gross = q * (parseFloat(selling_rate) || 0)
  const base_cost = q * (parseFloat(base_rate) || 0)
  const partner_share = gross * (parseFloat(partner_percent) || 0) / 100
  const commission_share = gross * (parseFloat(commission_percent) || 0) / 100
  const net_profit = gross - base_cost - partner_share - commission_share
  return { gross, base_cost, partner_share, commission_share, net_profit }
}

const EMPTY_PROFILE = { name: '', base_rate: '', selling_rate: '', partner_percent: '', commission_percent: '', active: true }

// ── Sub-components ────────────────────────────────────────────────────────────

function TabBar({ tab, setTab, ps }) {
  const tabs = [
    { key: 'profiles',    label: ps.tabProfiles,   icon: UserCircle2 },
    { key: 'calculator',  label: ps.tabCalculator, icon: Calculator },
    { key: 'history',     label: ps.tabHistory,    icon: History },
    { key: 'hui',         label: ps.tabHui,        icon: Coins },
  ]
  return (
    <div className="flex border-b border-ink-100 mb-6 overflow-x-auto">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

function ProfileForm({ initial, onSave, onCancel, ps, common }) {
  const [form, setForm] = useState({ ...EMPTY_PROFILE, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
      <h3 className="text-sm font-bold text-ink-800">{initial?.id ? ps.editProfile : ps.newProfile}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-sm">{ps.profileName}</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder={ps.profileName} />
        </div>
        <div>
          <label className="label-sm">{ps.baseRate}</label>
          <input className="input-field" type="number" value={form.base_rate} onChange={e => set('base_rate', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label-sm">{ps.sellingRate}</label>
          <input className="input-field" type="number" value={form.selling_rate} onChange={e => set('selling_rate', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label-sm">{ps.partnerPercent}</label>
          <input className="input-field" type="number" value={form.partner_percent} onChange={e => set('partner_percent', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label-sm">{ps.commissionPercent}</label>
          <input className="input-field" type="number" value={form.commission_percent} onChange={e => set('commission_percent', e.target.value)} placeholder="0" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <button type="button" onClick={() => set('active', !form.active)} className="flex items-center gap-1.5 text-sm text-ink-600">
            {form.active ? <CheckCircle2 className="w-5 h-5 text-brand-600" /> : <Circle className="w-5 h-5 text-ink-300" />}
            {ps.active}
          </button>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button className="btn-primary text-sm" onClick={() => onSave(form)}>{common.save}</button>
        <button className="btn-secondary text-sm" onClick={onCancel}>{common.cancel}</button>
      </div>
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function ProfilesTab({ profiles, loading, onRefresh, userId, ps, common }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (form) => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await upsertProfile(userId, editing ? { ...form, id: editing.id } : form)
      setShowForm(false)
      setEditing(null)
      onRefresh()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(ps.confirmDelete)) return
    await deleteProfile(id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {!showForm && !editing && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> {ps.newProfile}
        </button>
      )}
      {showForm && !editing && (
        <ProfileForm initial={EMPTY_PROFILE} onSave={handleSave} onCancel={() => setShowForm(false)} ps={ps} common={common} />
      )}
      {editing && (
        <ProfileForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} ps={ps} common={common} />
      )}

      {loading ? (
        <div className="text-sm text-ink-400 py-6 text-center">…</div>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-ink-400 py-6 text-center">{ps.noProfiles}</p>
      ) : (
        <div className="space-y-2">
          {profiles.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-ink-100 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-800 truncate">{p.name}</span>
                  {!p.active && <span className="text-[10px] bg-ink-100 text-ink-400 rounded px-1.5 py-0.5">off</span>}
                </div>
                <div className="text-xs text-ink-500 mt-0.5 space-x-3">
                  <span>{ps.baseRate}: {Number(p.base_rate).toLocaleString()}</span>
                  <span>{ps.sellingRate}: {Number(p.selling_rate).toLocaleString()}</span>
                  <span>{ps.partnerPercent}: {p.partner_percent}%</span>
                  <span>{ps.commissionPercent}: {p.commission_percent}%</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="p-2 rounded-lg hover:bg-ink-100 text-ink-500" onClick={() => { setEditing(p); setShowForm(false) }}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-red-400" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CalculatorTab({ profiles, userId, onHistoryChange, ps, common }) {
  const [profileId, setProfileId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('ps_currency') || 'VND' } catch { return 'VND' }
  })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const activeProfiles = profiles.filter(p => p.active)
  const selectedProfile = profiles.find(p => p.id === profileId)

  const handleCurrency = (c) => {
    setCurrency(c)
    try { localStorage.setItem('ps_currency', c) } catch {}
    setResult(null)
  }

  const handleCalculate = () => {
    if (!selectedProfile || !quantity) return
    const r = calcProfit({ quantity, ...selectedProfile })
    setResult(r)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!result || !selectedProfile) return
    setSaving(true)
    try {
      await saveHistory(userId, {
        profile_id: selectedProfile.id,
        profile_name: selectedProfile.name,
        quantity: parseFloat(quantity),
        ...result,
        currency,
      })
      setSaved(true)
      onHistoryChange()
    } catch { alert(ps.errorSave) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Currency */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-ink-500 font-medium">{ps.currency}:</span>
        {CURRENCIES.map(c => (
          <button
            key={c.code}
            onClick={() => handleCurrency(c.code)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
              currency === c.code ? 'bg-brand-600 text-white border-brand-600' : 'border-ink-200 text-ink-600 hover:border-brand-400'
            }`}
          >
            {c.code} {c.symbol}
          </button>
        ))}
      </div>

      {/* Profile select */}
      <div>
        <label className="label-sm">{ps.tabProfiles}</label>
        <select
          className="input-field"
          value={profileId}
          onChange={e => { setProfileId(e.target.value); setResult(null); setSaved(false) }}
        >
          <option value="">{ps.selectProfile}</option>
          {activeProfiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProfile && (
        <div className="text-xs text-ink-500 bg-ink-50 rounded-lg px-3 py-2 space-x-3">
          <span>{ps.baseRate}: {Number(selectedProfile.base_rate).toLocaleString()}</span>
          <span>{ps.sellingRate}: {Number(selectedProfile.selling_rate).toLocaleString()}</span>
          <span>{ps.partnerPercent}: {selectedProfile.partner_percent}%</span>
          <span>{ps.commissionPercent}: {selectedProfile.commission_percent}%</span>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="label-sm">{ps.quantity}</label>
        <input
          className="input-field"
          type="number"
          step="any"
          value={quantity}
          onChange={e => { setQuantity(e.target.value); setResult(null); setSaved(false) }}
          placeholder="1"
        />
      </div>

      <button
        className="btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleCalculate}
        disabled={!selectedProfile || !quantity}
      >
        <Calculator className="w-4 h-4" /> {ps.calculate}
      </button>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-50 bg-ink-50">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wide">{ps.quantity}: {parseFloat(quantity).toLocaleString()}</span>
          </div>
          {[
            { label: ps.gross,         value: result.gross,            bold: false },
            { label: ps.baseCost,      value: result.base_cost,        bold: false },
            { label: ps.partnerShare,  value: result.partner_share,    bold: false },
            { label: ps.commission,    value: result.commission_share,  bold: false },
            { label: ps.netProfit,     value: result.net_profit,        bold: true  },
          ].map(({ label, value, bold }) => (
            <div key={label} className={`flex justify-between items-center px-4 py-2.5 ${bold ? 'bg-brand-50 border-t border-brand-100' : 'border-b border-ink-50'}`}>
              <span className={`text-sm ${bold ? 'font-bold text-brand-700' : 'text-ink-600'}`}>{label}</span>
              <span className={`text-sm font-mono ${bold ? 'font-bold text-brand-700' : 'text-ink-800'}`}>
                {getCurrency(currency).symbol}{fmt(value, currency)}
              </span>
            </div>
          ))}
          <div className="px-4 py-3">
            {saved ? (
              <span className="text-sm text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{ps.saved}</span>
            ) : (
              <button className="btn-secondary text-sm w-full" onClick={handleSave} disabled={saving}>
                {saving ? '…' : ps.saveResult}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryTab({ profiles, history, loading, onRefresh, ps }) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [filterProfile, setFilterProfile] = useState('')

  const filtered = history.filter(h => {
    if (filterProfile && h.profile_id !== filterProfile) return false
    if (dateFrom && h.created_at < dateFrom) return false
    if (dateTo   && h.created_at > dateTo + 'T23:59:59') return false
    return true
  })

  const totals = filtered.reduce((acc, h) => ({
    gross:      acc.gross      + Number(h.gross_revenue),
    base_cost:  acc.base_cost  + Number(h.base_cost),
    partner:    acc.partner    + Number(h.partner_share),
    commission: acc.commission + Number(h.commission_share),
    net:        acc.net        + Number(h.net_profit),
  }), { gross: 0, base_cost: 0, partner: 0, commission: 0, net: 0 })

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return
    await deleteHistoryEntry(id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="label-sm">{ps.filterDate} (from)</label>
          <input className="input-field" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="label-sm">{ps.filterDate} (to)</label>
          <input className="input-field" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="label-sm">{ps.filterProfile}</label>
          <select className="input-field" value={filterProfile} onChange={e => setFilterProfile(e.target.value)}>
            <option value="">{ps.allProfiles}</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-ink-400 py-8 text-center">…</div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-400 py-8 text-center">{ps.noHistory}</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map(h => {
              const sym = getCurrency(h.currency || 'VND').symbol
              return (
                <div key={h.id} className="bg-white rounded-xl border border-ink-100 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-ink-800 text-sm">{h.profile_name || '—'}</div>
                      <div className="text-[11px] text-ink-400">{new Date(h.created_at).toLocaleDateString()} · {h.currency} · ×{Number(h.quantity).toLocaleString()}</div>
                    </div>
                    <button className="p-1 rounded hover:bg-red-50 text-red-300 hover:text-red-500 shrink-0" onClick={() => handleDelete(h.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-ink-400">{ps.gross}</span><span className="font-mono text-ink-700">{sym}{fmt(h.gross_revenue, h.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{ps.baseCost}</span><span className="font-mono text-ink-600">{sym}{fmt(h.base_cost, h.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{ps.partnerShare}</span><span className="font-mono text-ink-600">{sym}{fmt(h.partner_share, h.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{ps.commission}</span><span className="font-mono text-ink-600">{sym}{fmt(h.commission_share, h.currency)}</span></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-ink-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-700">{ps.netProfit}</span>
                    <span className="font-mono font-bold text-brand-700 text-sm">{sym}{fmt(h.net_profit, h.currency)}</span>
                  </div>
                </div>
              )
            })}
            {/* Mobile totals */}
            <div className="bg-brand-50 rounded-xl border border-brand-100 p-3 text-xs font-bold text-brand-700">
              <div className="mb-1">{ps.totals} ({filtered.length})</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between"><span>{ps.gross}</span><span className="font-mono">{fmt(totals.gross, 'VND')}</span></div>
                <div className="flex justify-between"><span>{ps.baseCost}</span><span className="font-mono">{fmt(totals.base_cost, 'VND')}</span></div>
                <div className="flex justify-between"><span>{ps.partnerShare}</span><span className="font-mono">{fmt(totals.partner, 'VND')}</span></div>
                <div className="flex justify-between"><span>{ps.commission}</span><span className="font-mono">{fmt(totals.commission, 'VND')}</span></div>
                <div className="flex justify-between col-span-2 pt-1 border-t border-brand-100"><span>{ps.netProfit}</span><span className="font-mono">{fmt(totals.net, 'VND')}</span></div>
              </div>
            </div>
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-500 uppercase tracking-wide">
                  <th className="text-left py-2 px-3">{ps.tabProfiles}</th>
                  <th className="text-right py-2 px-3">{ps.quantity}</th>
                  <th className="text-right py-2 px-3">{ps.gross}</th>
                  <th className="text-right py-2 px-3">{ps.baseCost}</th>
                  <th className="text-right py-2 px-3">{ps.partnerShare}</th>
                  <th className="text-right py-2 px-3">{ps.commission}</th>
                  <th className="text-right py-2 px-3 font-bold text-brand-700">{ps.netProfit}</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const sym = getCurrency(h.currency || 'VND').symbol
                  return (
                    <tr key={h.id} className="border-b border-ink-50 hover:bg-ink-50 transition">
                      <td className="py-2 px-3 font-medium text-ink-800">
                        <div>{h.profile_name || '—'}</div>
                        <div className="text-[11px] text-ink-400">{new Date(h.created_at).toLocaleDateString()} · {h.currency}</div>
                      </td>
                      <td className="text-right py-2 px-3 font-mono text-ink-700">{Number(h.quantity).toLocaleString()}</td>
                      <td className="text-right py-2 px-3 font-mono text-ink-700">{sym}{fmt(h.gross_revenue, h.currency)}</td>
                      <td className="text-right py-2 px-3 font-mono text-ink-600">{sym}{fmt(h.base_cost, h.currency)}</td>
                      <td className="text-right py-2 px-3 font-mono text-ink-600">{sym}{fmt(h.partner_share, h.currency)}</td>
                      <td className="text-right py-2 px-3 font-mono text-ink-600">{sym}{fmt(h.commission_share, h.currency)}</td>
                      <td className="text-right py-2 px-3 font-mono font-bold text-brand-700">{sym}{fmt(h.net_profit, h.currency)}</td>
                      <td className="py-2 px-2">
                        <button className="p-1 rounded hover:bg-red-50 text-red-300 hover:text-red-500" onClick={() => handleDelete(h.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-brand-50 text-xs font-bold text-brand-700 border-t border-brand-100">
                  <td className="py-2 px-3" colSpan={2}>{ps.totals} ({filtered.length})</td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(totals.gross, 'VND')}</td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(totals.base_cost, 'VND')}</td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(totals.partner, 'VND')}</td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(totals.commission, 'VND')}</td>
                  <td className="text-right py-2 px-3 font-mono">{fmt(totals.net, 'VND')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfitSplit() {
  const { user } = useAuth()
  const { t } = useLang()
  const ps = t.profitSplit
  const common = t.common

  const [tab, setTab] = useState('profiles')
  const [profiles, setProfiles] = useState([])
  const [history, setHistory] = useState([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchProfiles = useCallback(async () => {
    if (!user) return
    setLoadingProfiles(true)
    try { setProfiles(await getProfiles(user.id)) }
    finally { setLoadingProfiles(false) }
  }, [user])

  const fetchHistory = useCallback(async () => {
    if (!user) return
    setLoadingHistory(true)
    try { setHistory(await getHistory(user.id)) }
    finally { setLoadingHistory(false) }
  }, [user])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])
  useEffect(() => { if (tab === 'history') fetchHistory() }, [tab, fetchHistory])

  return (
    <div className="container-app py-6">
      <div className="flex items-center gap-2 mb-6">
        <Percent className="w-5 h-5 text-brand-600" />
        <h1 className="text-xl font-bold text-ink-900">{ps.title}</h1>
      </div>

      <TabBar tab={tab} setTab={setTab} ps={ps} />

      {tab === 'profiles' && (
        <ProfilesTab
          profiles={profiles}
          loading={loadingProfiles}
          onRefresh={fetchProfiles}
          userId={user?.id}
          ps={ps}
          common={common}
        />
      )}
      {tab === 'calculator' && (
        <CalculatorTab
          profiles={profiles}
          userId={user?.id}
          onHistoryChange={fetchHistory}
          ps={ps}
          common={common}
        />
      )}
      {tab === 'history' && (
        <HistoryTab
          profiles={profiles}
          history={history}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          ps={ps}
        />
      )}
      {tab === 'hui' && (
        <HuiTab
          userId={user?.id}
          h={t.hui}
          common={common}
        />
      )}
    </div>
  )
}
