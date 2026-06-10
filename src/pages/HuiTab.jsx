import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle2, Circle, Users, RotateCcw, LayoutDashboard, CreditCard, Clock } from 'lucide-react'
import {
  getHuiGroups, upsertHuiGroup, deleteHuiGroup,
  getHuiMembers, upsertHuiMember, deleteHuiMember,
  getHuiRounds, saveHuiRound, deleteHuiRound,
  getHuiPayments, upsertHuiPayment, bulkInsertHuiPayments,
} from '../lib/profitSplitDb.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtN = (n) => Number(n || 0).toLocaleString('vi-VN')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const FREQ_KEYS = ['weekly', 'biweekly', 'monthly']
const STATUS_KEYS = ['active', 'completed', 'cancelled']

function freqLabel(freq, h) {
  if (freq === 'weekly')   return h.freqWeekly
  if (freq === 'biweekly') return h.freqBiweekly
  return h.freqMonthly
}

function statusLabel(s, h) {
  if (s === 'completed') return h.statusCompleted
  if (s === 'cancelled') return h.statusCancelled
  return h.statusActive
}

function statusColor(s) {
  if (s === 'completed') return 'bg-green-50 text-green-700'
  if (s === 'cancelled') return 'bg-red-50 text-red-600'
  return 'bg-brand-50 text-brand-700'
}

function payStatusColor(s) {
  if (s === 'paid')    return 'bg-green-50 text-green-700'
  if (s === 'partial') return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-500'
}

// Calculate estimated end date
function calcEndDate(startDate, memberCount, frequency) {
  if (!startDate || !memberCount) return null
  const d = new Date(startDate)
  const n = parseInt(memberCount) - 1
  if (n < 0) return null
  if (frequency === 'weekly')   d.setDate(d.getDate() + n * 7)
  else if (frequency === 'biweekly') d.setDate(d.getDate() + n * 14)
  else d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

function calcNextRoundDate(startDate, roundsDone, frequency) {
  if (!startDate) return null
  const d = new Date(startDate)
  if (frequency === 'weekly')        d.setDate(d.getDate() + roundsDone * 7)
  else if (frequency === 'biweekly') d.setDate(d.getDate() + roundsDone * 14)
  else                               d.setMonth(d.getMonth() + roundsDone)
  return d.toISOString().slice(0, 10)
}

// ── Group Form ────────────────────────────────────────────────────────────────

const EMPTY_GROUP = { name: '', member_count: '', amount_per_member: '', start_date: '', frequency: 'monthly', status: 'active', active: true }

function GroupForm({ initial, onSave, onCancel, h, common }) {
  const [form, setForm] = useState({ ...EMPTY_GROUP, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const endDate = calcEndDate(form.start_date, form.member_count, form.frequency)

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
      <h3 className="text-sm font-bold text-ink-800">{initial?.id ? h.editGroup : h.newGroup}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label-sm">{h.groupName}</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder={h.groupName} />
        </div>
        <div>
          <label className="label-sm">{h.memberCount}</label>
          <input className="input-field" type="number" value={form.member_count} onChange={e => set('member_count', e.target.value)} placeholder="10" />
        </div>
        <div>
          <label className="label-sm">{h.amountPerMember}</label>
          <input className="input-field" type="number" value={form.amount_per_member} onChange={e => set('amount_per_member', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label-sm">{h.startDate}</label>
          <input className="input-field" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <label className="label-sm">{h.frequency}</label>
          <select className="input-field" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
            {FREQ_KEYS.map(k => <option key={k} value={k}>{freqLabel(k, h)}</option>)}
          </select>
        </div>
        <div>
          <label className="label-sm">{h.status}</label>
          <select className="input-field" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
            {STATUS_KEYS.map(k => <option key={k} value={k}>{statusLabel(k, h)}</option>)}
          </select>
        </div>
        {endDate && (
          <div className="flex items-center gap-1.5 text-xs text-ink-500 pt-1">
            <Clock className="w-3.5 h-3.5" />
            {h.estimatedEndDate}: <span className="font-semibold text-ink-700">{fmtDate(endDate)}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary text-sm" onClick={() => onSave({ ...form, estimated_end_date: endDate })}>{common.save}</button>
        <button className="btn-secondary text-sm" onClick={onCancel}>{common.cancel}</button>
      </div>
    </div>
  )
}

// ── Groups List ───────────────────────────────────────────────────────────────

function GroupsList({ userId, h, common, onSelectGroup }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setGroups(await getHuiGroups(userId)) } finally { setLoading(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (!form.name.trim()) return
    await upsertHuiGroup(userId, editing ? { ...form, id: editing.id } : form)
    setShowForm(false); setEditing(null); load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm(h.confirmDelete)) return
    await deleteHuiGroup(id); load()
  }

  return (
    <div className="space-y-4">
      {!showForm && !editing && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> {h.newGroup}
        </button>
      )}
      {showForm && <GroupForm initial={EMPTY_GROUP} onSave={handleSave} onCancel={() => setShowForm(false)} h={h} common={common} />}
      {editing  && <GroupForm initial={editing}      onSave={handleSave} onCancel={() => setEditing(null)} h={h} common={common} />}

      {loading ? (
        <div className="text-sm text-ink-400 py-6 text-center">…</div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-ink-400 py-6 text-center">{h.noGroups}</p>
      ) : (
        <div className="space-y-2">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-ink-100 p-4 cursor-pointer hover:border-brand-300 transition" onClick={() => onSelectGroup(g)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink-800">{g.name}</span>
                    <span className={`text-[10px] rounded px-1.5 py-0.5 font-semibold ${statusColor(g.status)}`}>{statusLabel(g.status, h)}</span>
                  </div>
                  <div className="text-xs text-ink-500 mt-1 space-x-2">
                    <span><Users className="w-3 h-3 inline mr-0.5" />{g.member_count}</span>
                    <span>{fmtN(g.amount_per_member)}/phần</span>
                    <span>{freqLabel(g.frequency, h)}</span>
                  </div>
                  {(g.start_date || g.estimated_end_date) && (
                    <div className="text-xs text-ink-400 mt-0.5">
                      {g.start_date && fmtDate(g.start_date)}
                      {g.start_date && g.estimated_end_date && ' → '}
                      {g.estimated_end_date && fmtDate(g.estimated_end_date)}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button className="p-2 rounded-lg hover:bg-ink-100 text-ink-400" onClick={() => { setEditing(g); setShowForm(false) }}><Pencil className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-red-50 text-red-400" onClick={() => handleDelete(g.id)}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dashboard Panel ───────────────────────────────────────────────────────────

function DashboardPanel({ group, rounds, members, h }) {
  const paidCount = members.filter(m => m.has_received_payout).length
  const remaining = members.filter(m => !m.has_received_payout && m.active).length
  const currentRound = rounds.length
  const grossPot = Number(group.member_count) * Number(group.amount_per_member)
  const nextDate = calcNextRoundDate(group.start_date, currentRound, group.frequency)

  const stats = [
    { label: h.memberCount,      value: group.member_count,                color: 'text-ink-800' },
    { label: h.amountPerMember,  value: fmtN(group.amount_per_member),      color: 'text-ink-800' },
    { label: h.grossPotPerRound, value: fmtN(grossPot),                     color: 'text-brand-700' },
    { label: h.currentRound,     value: `${currentRound} / ${group.member_count}`, color: 'text-ink-800' },
    { label: h.paidOutCount,     value: paidCount,                          color: 'text-green-700' },
    { label: h.remainingCount,   value: remaining,                           color: 'text-amber-700' },
    { label: h.startDate,        value: fmtDate(group.start_date),          color: 'text-ink-600' },
    { label: h.estimatedEndDate, value: fmtDate(group.estimated_end_date),  color: 'text-ink-600' },
    { label: h.nextRoundDate,    value: nextDate ? fmtDate(nextDate) : '—', color: 'text-brand-600' },
  ]

  return (
    <div className="space-y-4">
      <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 ${statusColor(group.status)}`}>
        {statusLabel(group.status, h)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-ink-100 p-3">
            <div className="text-[11px] text-ink-400 mb-0.5">{label}</div>
            <div className={`text-sm font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Paid members list */}
      {paidCount > 0 && (
        <div className="bg-green-50 rounded-xl p-3">
          <div className="text-xs font-bold text-green-700 mb-2">{h.paidMembers} ({paidCount})</div>
          <div className="flex flex-wrap gap-1.5">
            {members.filter(m => m.has_received_payout).map(m => (
              <span key={m.id} className="text-xs bg-white border border-green-100 text-green-700 rounded px-2 py-0.5">
                {m.name} {m.payout_round ? `(kỳ ${m.payout_round})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unpaid members list */}
      {remaining > 0 && (
        <div className="bg-amber-50 rounded-xl p-3">
          <div className="text-xs font-bold text-amber-700 mb-2">{h.unpaidMembers} ({remaining})</div>
          <div className="flex flex-wrap gap-1.5">
            {members.filter(m => !m.has_received_payout && m.active).map(m => (
              <span key={m.id} className="text-xs bg-white border border-amber-100 text-amber-700 rounded px-2 py-0.5">{m.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Member payment status table */}
      {members.length > 0 && (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <div className="px-3 py-2 bg-ink-50 border-b border-ink-100">
            <span className="text-xs font-bold text-ink-600">{h.memberDebtSummary} · {h.completedRounds}: {currentRound}</span>
          </div>
          <div className="divide-y divide-ink-50">
            {members.filter(m => m.active).map(m => {
              const paid    = Number(m.paid_rounds_count || 0)
              const owed    = Number(m.owed_rounds_count || 0)
              const prevD   = Number(m.previous_debt || 0)
              const amtPer  = Number(group.amount_per_member || 0)
              const dueSoFar  = currentRound * amtPer
              const paidAmt   = paid * amtPer
              const totalDebt = dueSoFar - paidAmt + prevD
              const debtColor = totalDebt > 0 ? 'text-red-600' : 'text-green-600'
              return (
                <div key={m.id} className="px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-ink-800">{m.name}</span>
                      {m.has_received_payout && <span className="text-[10px] bg-green-50 text-green-700 rounded px-1 font-semibold">✓ hốt kỳ {m.payout_round}</span>}
                    </div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {h.paidRoundsCount}: {paid} · {h.owedRoundsCount}: {owed}
                      {prevD > 0 && ` · ${h.previousDebt}: ${fmtN(prevD)}`}
                    </div>
                  </div>
                  <div className={`text-sm font-bold font-mono shrink-0 ${debtColor}`}>
                    {totalDebt > 0 ? `-${fmtN(totalDebt)}` : totalDebt < 0 ? `+${fmtN(Math.abs(totalDebt))}` : '✓'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Members Panel ─────────────────────────────────────────────────────────────

const EMPTY_MEMBER = { name: '', phone: '', note: '', active: true, has_received_payout: false, payout_round: '', payout_date: '', paid_rounds_count: '', owed_rounds_count: '', previous_debt: '' }

function MembersPanel({ userId, group, members, rounds, onRefresh, h, common }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_MEMBER })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    const payload = {
      ...form,
      group_id: group.id,
      payout_round: form.payout_round ? parseInt(form.payout_round) : null,
      payout_date: form.payout_date || null,
      paid_rounds_count: parseFloat(form.paid_rounds_count) || 0,
      owed_rounds_count: parseFloat(form.owed_rounds_count) || 0,
      previous_debt: parseFloat(form.previous_debt) || 0,
    }
    await upsertHuiMember(userId, editing ? { ...payload, id: editing.id } : payload)
    setShowForm(false); setEditing(null)
    setForm({ ...EMPTY_MEMBER })
    onRefresh()
  }

  const startEdit = (m) => {
    setEditing(m)
    setForm({
      name: m.name, phone: m.phone || '', note: m.note || '', active: m.active,
      has_received_payout: m.has_received_payout, payout_round: m.payout_round || '', payout_date: m.payout_date || '',
      paid_rounds_count: m.paid_rounds_count ?? '', owed_rounds_count: m.owed_rounds_count ?? '', previous_debt: m.previous_debt ?? '',
    })
    setShowForm(false)
  }

  // Quick actions — bump paid or owed count directly on member
  const quickPaid = async (m) => {
    await upsertHuiMember(userId, { ...m, group_id: group.id, paid_rounds_count: Number(m.paid_rounds_count || 0) + 1 })
    onRefresh()
  }
  const quickOwed = async (m) => {
    await upsertHuiMember(userId, { ...m, group_id: group.id, owed_rounds_count: Number(m.owed_rounds_count || 0) + 1 })
    onRefresh()
  }

  const completedRounds = rounds.length

  const handleDelete = async (id) => {
    if (!window.confirm(h.confirmDelete)) return
    await deleteHuiMember(id); onRefresh()
  }

  return (
    <div className="space-y-3">
      {!showForm && !editing && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setShowForm(true); setEditing(null) }}>
          <Plus className="w-4 h-4" /> {h.newMember}
        </button>
      )}

      {(showForm || editing) && (
        <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm">{h.memberName}</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder={h.memberName} />
            </div>
            <div>
              <label className="label-sm">{h.phone}</label>
              <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0909…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-sm">{h.note}</label>
              <input className="input-field" value={form.note} onChange={e => set('note', e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => set('active', !form.active)} className="flex items-center gap-1.5 text-sm text-ink-600">
                {form.active ? <CheckCircle2 className="w-5 h-5 text-brand-600" /> : <Circle className="w-5 h-5 text-ink-300" />}
                {h.active}
              </button>
              <button type="button" onClick={() => set('has_received_payout', !form.has_received_payout)} className="flex items-center gap-1.5 text-sm text-ink-600">
                {form.has_received_payout ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-ink-300" />}
                {h.hasReceivedPayout}
              </button>
            </div>
            {form.has_received_payout && (
              <>
                <div>
                  <label className="label-sm">{h.payoutRound}</label>
                  <input className="input-field" type="number" value={form.payout_round} onChange={e => set('payout_round', e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label className="label-sm">{h.payoutDate}</label>
                  <input className="input-field" type="date" value={form.payout_date} onChange={e => set('payout_date', e.target.value)} />
                </div>
              </>
            )}
            {/* Import existing status */}
            <div className="sm:col-span-2 pt-1 border-t border-ink-100">
              <div className="text-xs font-bold text-ink-600 mb-2">{h.importStatus}</div>
              <div className="text-xs text-ink-400 mb-2">{h.importStatusSub}</div>
            </div>
            <div>
              <label className="label-sm">{h.paidRoundsCount}</label>
              <input className="input-field" type="number" step="0.5" value={form.paid_rounds_count} onChange={e => set('paid_rounds_count', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label-sm">{h.owedRoundsCount}</label>
              <input className="input-field" type="number" step="0.5" value={form.owed_rounds_count} onChange={e => set('owed_rounds_count', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label-sm">{h.previousDebt}</label>
              <input className="input-field" type="number" value={form.previous_debt} onChange={e => set('previous_debt', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={handleSave}>{common.save}</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditing(null) }}>{common.cancel}</button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-ink-400 py-4 text-center">{h.noMembers}</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => {
            const paid   = Number(m.paid_rounds_count || 0)
            const owed   = Number(m.owed_rounds_count || 0)
            const prevD  = Number(m.previous_debt || 0)
            const amtPer = Number(group.amount_per_member || 0)
            const dueSoFar = completedRounds * amtPer
            const paidAmt  = paid * amtPer
            const totalDebt = dueSoFar - paidAmt + prevD
            return (
              <div key={m.id} className="bg-white rounded-xl border border-ink-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink-800 text-sm">{m.name}</span>
                      {m.has_received_payout && (
                        <span className="text-[10px] bg-green-50 text-green-700 rounded px-1.5 py-0.5 font-semibold">
                          ✓ {h.hasReceivedPayout}{m.payout_round ? ` kỳ ${m.payout_round}` : ''}
                        </span>
                      )}
                      {!m.active && <span className="text-[10px] bg-ink-100 text-ink-400 rounded px-1.5">off</span>}
                    </div>
                    {/* Debt summary row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs">
                      <span className="text-green-700">{h.paidRoundsCount}: <b>{paid}</b></span>
                      {owed > 0 && <span className="text-red-500">{h.owedRoundsCount}: <b>{owed}</b></span>}
                      {prevD > 0 && <span className="text-amber-600">{h.previousDebt}: <b>{fmtN(prevD)}</b></span>}
                      {totalDebt > 0 && <span className="text-red-600 font-semibold">{h.totalDebt}: {fmtN(totalDebt)}</span>}
                      {totalDebt <= 0 && completedRounds > 0 && <span className="text-green-600 font-semibold">✓ {h.payStatusPaid}</span>}
                    </div>
                    {(m.phone || m.note) && (
                      <div className="text-xs text-ink-400 mt-0.5">{m.phone}{m.phone && m.note ? ' · ' : ''}{m.note}</div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => startEdit(m)}><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-red-400" onClick={() => handleDelete(m.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {/* Quick actions */}
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-ink-50">
                  <button onClick={() => quickPaid(m)} className="text-[11px] bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded px-2 py-1 transition">
                    {h.markPaidCurrentRound}
                  </button>
                  <button onClick={() => quickOwed(m)} className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded px-2 py-1 transition">
                    {h.markOwedCurrentRound}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Rounds Panel ──────────────────────────────────────────────────────────────

function RoundsPanel({ userId, group, members, rounds, onRefresh, h, common }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ round_date: '', winner_member_id: '', bid_amount: '', notes: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const paidMemberIds = new Set(rounds.map(r => r.winner_member_id).filter(Boolean))
  const unpaidMembers = members.filter(m => m.active && !paidMemberIds.has(m.id))

  const preview = (() => {
    const bid = parseFloat(form.bid_amount) || 0
    const gross = Number(group.member_count) * Number(group.amount_per_member)
    const winnerReceive = gross - bid
    const remainingCount = Math.max(unpaidMembers.length - 1, 0)
    const bonusPerRemaining = remainingCount > 0 ? bid / remainingCount : 0
    return { gross, winnerReceive, bonusPerRemaining, remainingCount }
  })()

  const handleSave = async () => {
    if (!form.round_date || !form.winner_member_id) return
    const winner = members.find(m => m.id === form.winner_member_id)

    // Save round
    await saveHuiRound(userId, {
      group_id: group.id,
      round_number: rounds.length + 1,
      round_date: form.round_date,
      winner_member_id: form.winner_member_id,
      winner_name: winner?.name || '',
      bid_amount: parseFloat(form.bid_amount) || 0,
      gross_pot: preview.gross,
      winner_receive: preview.winnerReceive,
      bonus_per_remaining_member: preview.bonusPerRemaining,
      remaining_unpaid_count: preview.remainingCount,
      notes: form.notes,
    })

    // Mark winner as received
    await upsertHuiMember(userId, {
      ...winner,
      group_id: group.id,
      has_received_payout: true,
      payout_round: rounds.length + 1,
      payout_date: form.round_date,
    })

    // Auto-create payment records for all active members
    const roundNum = rounds.length + 1
    const payloads = members.filter(m => m.active).map(m => ({
      group_id: group.id,
      round_number: roundNum,
      member_id: m.id,
      member_name: m.name,
      amount_due: Number(group.amount_per_member),
      amount_paid: 0,
      paid_date: null,
      status: 'unpaid',
    }))
    if (payloads.length > 0) await bulkInsertHuiPayments(userId, payloads)

    setShowForm(false)
    setForm({ round_date: '', winner_member_id: '', bid_amount: '', notes: '' })
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!window.confirm(h.confirmDelete)) return
    await deleteHuiRound(id); onRefresh()
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-brand-50 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-brand-700">{rounds.length}</div>
          <div className="text-[11px] text-brand-500">{h.rounds}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-green-700">{paidMemberIds.size}</div>
          <div className="text-[11px] text-green-600">{h.paidMembers}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-amber-700">{unpaidMembers.length}</div>
          <div className="text-[11px] text-amber-600">{h.unpaidMembers}</div>
        </div>
      </div>

      {!showForm && unpaidMembers.length > 0 && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> {h.newRound}
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-ink-800">{h.newRound} #{rounds.length + 1}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm">{h.roundDate}</label>
              <input className="input-field" type="date" value={form.round_date} onChange={e => set('round_date', e.target.value)} />
            </div>
            <div>
              <label className="label-sm">{h.winner}</label>
              <select className="input-field" value={form.winner_member_id} onChange={e => set('winner_member_id', e.target.value)}>
                <option value="">{h.selectWinner}</option>
                {unpaidMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm">{h.bidAmount}</label>
              <input className="input-field" type="number" value={form.bid_amount} onChange={e => set('bid_amount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label-sm">{common.note}</label>
              <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          {form.winner_member_id && (
            <div className="bg-ink-50 rounded-lg p-3 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-ink-500">{h.grossPot}</span><span className="font-mono font-semibold">{fmtN(preview.gross)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">{h.winnerReceive}</span><span className="font-mono font-bold text-brand-700">{fmtN(preview.winnerReceive)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">{h.bonusPerRemaining} (÷{preview.remainingCount})</span><span className="font-mono text-green-700">{fmtN(preview.bonusPerRemaining)}</span></div>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={handleSave} disabled={!form.round_date || !form.winner_member_id}>{common.save}</button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>{common.cancel}</button>
          </div>
        </div>
      )}

      {rounds.length === 0 ? (
        <p className="text-sm text-ink-400 py-4 text-center">{h.noRounds}</p>
      ) : (
        <div className="space-y-2">
          {[...rounds].reverse().map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-ink-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">#{r.round_number}</span>
                    <span className="font-semibold text-ink-800 text-sm">{r.winner_name}</span>
                    <span className="text-xs text-ink-400">{fmtDate(r.round_date)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-ink-400">{h.grossPot}</span><span className="font-mono">{fmtN(r.gross_pot)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{h.bidAmount}</span><span className="font-mono">{fmtN(r.bid_amount)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{h.winnerReceive}</span><span className="font-mono text-brand-700 font-semibold">{fmtN(r.winner_receive)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-400">{h.bonusPerRemaining}</span><span className="font-mono text-green-700">{fmtN(r.bonus_per_remaining_member)}</span></div>
                  </div>
                  {r.notes && <div className="text-xs text-ink-400 mt-1">{r.notes}</div>}
                </div>
                <button className="p-1.5 rounded hover:bg-red-50 text-red-300 hover:text-red-500 shrink-0" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Payments Panel ────────────────────────────────────────────────────────────

const PAY_STATUSES = ['unpaid', 'partial', 'paid']

function payStatusLabel(s, h) {
  if (s === 'paid')    return h.payStatusPaid
  if (s === 'partial') return h.payStatusPartial
  return h.payStatusUnpaid
}

function PaymentsPanel({ userId, group, members, rounds, h, common }) {
  const [selectedRound, setSelectedRound] = useState('')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null) // payment id being edited
  const [editForm, setEditForm] = useState({})

  const load = useCallback(async (rn) => {
    if (!rn) return
    setLoading(true)
    try { setPayments(await getHuiPayments(userId, group.id, parseInt(rn))) }
    finally { setLoading(false) }
  }, [userId, group.id])

  useEffect(() => { load(selectedRound) }, [selectedRound, load])

  const totalDue       = payments.reduce((a, p) => a + Number(p.amount_due), 0)
  const totalCollected = payments.reduce((a, p) => a + Number(p.amount_paid), 0)
  const totalMissing   = totalDue - totalCollected

  const startEdit = (p) => {
    setEditing(p.id)
    setEditForm({ amount_paid: p.amount_paid, paid_date: p.paid_date || '', status: p.status })
  }

  const handleSave = async (p) => {
    const status = Number(editForm.amount_paid) >= Number(p.amount_due) ? 'paid'
      : Number(editForm.amount_paid) > 0 ? 'partial' : 'unpaid'
    await upsertHuiPayment(userId, {
      id: p.id,
      group_id: group.id,
      round_number: p.round_number,
      member_id: p.member_id,
      member_name: p.member_name,
      amount_due: p.amount_due,
      amount_paid: parseFloat(editForm.amount_paid) || 0,
      paid_date: editForm.paid_date || null,
      status,
    })
    setEditing(null)
    load(selectedRound)
  }

  return (
    <div className="space-y-4">
      {/* Round selector */}
      <div>
        <label className="label-sm">{h.selectRound}</label>
        <select className="input-field max-w-xs" value={selectedRound} onChange={e => setSelectedRound(e.target.value)}>
          <option value="">{h.selectRound}</option>
          {rounds.map(r => (
            <option key={r.id} value={r.round_number}>
              {h.roundNumber} {r.round_number} — {fmtDate(r.round_date)} ({r.winner_name})
            </option>
          ))}
        </select>
      </div>

      {!selectedRound ? null : loading ? (
        <div className="text-sm text-ink-400 py-4 text-center">…</div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-ink-400 py-4 text-center">{h.noPayments}</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-ink-50 rounded-lg p-2.5 text-center">
              <div className="text-sm font-bold text-ink-800">{fmtN(totalDue)}</div>
              <div className="text-[11px] text-ink-400">{h.amountDue}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5 text-center">
              <div className="text-sm font-bold text-green-700">{fmtN(totalCollected)}</div>
              <div className="text-[11px] text-green-600">{h.totalCollected}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <div className="text-sm font-bold text-red-600">{fmtN(totalMissing)}</div>
              <div className="text-[11px] text-red-400">{h.totalMissing}</div>
            </div>
          </div>

          {/* Payment rows */}
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-ink-100 p-3">
                {editing === p.id ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-ink-800">{p.member_name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label-sm">{h.amountPaid}</label>
                        <input className="input-field" type="number" value={editForm.amount_paid}
                          onChange={e => setEditForm(f => ({ ...f, amount_paid: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-sm">{h.paidDate}</label>
                        <input className="input-field" type="date" value={editForm.paid_date}
                          onChange={e => setEditForm(f => ({ ...f, paid_date: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-xs" onClick={() => handleSave(p)}>{common.save}</button>
                      <button className="btn-secondary text-xs" onClick={() => setEditing(null)}>{common.cancel}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-ink-800 text-sm">{p.member_name}</span>
                        <span className={`text-[10px] rounded px-1.5 py-0.5 font-semibold ${payStatusColor(p.status)}`}>
                          {payStatusLabel(p.status, h)}
                        </span>
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5 space-x-2">
                        <span>{h.amountDue}: {fmtN(p.amount_due)}</span>
                        <span>{h.amountPaid}: {fmtN(p.amount_paid)}</span>
                        {p.paid_date && <span>{fmtDate(p.paid_date)}</span>}
                      </div>
                    </div>
                    <button className="p-1.5 rounded hover:bg-ink-100 text-ink-400 shrink-0" onClick={() => startEdit(p)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Group Detail ──────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { key: 'dashboard', labelKey: 'dashboard',  icon: LayoutDashboard },
  { key: 'rounds',    labelKey: 'rounds',     icon: RotateCcw },
  { key: 'members',   labelKey: 'members',    icon: Users },
  { key: 'payments',  labelKey: 'payments',   icon: CreditCard },
]

function GroupDetail({ userId, group, onBack, h, common }) {
  const [subTab, setSubTab] = useState('dashboard')
  const [members, setMembers] = useState([])
  const [rounds,  setRounds]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [m, r] = await Promise.all([
        getHuiMembers(userId, group.id),
        getHuiRounds(userId, group.id),
      ])
      setMembers(m); setRounds(r)
    } finally { setLoading(false) }
  }, [userId, group.id])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 -ml-1" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-ink-900">{group.name}</h2>
            <span className={`text-[10px] rounded px-1.5 py-0.5 font-semibold ${statusColor(group.status)}`}>{statusLabel(group.status, h)}</span>
          </div>
          <div className="text-xs text-ink-400">
            <Users className="w-3 h-3 inline mr-0.5" />{group.member_count} · {fmtN(group.amount_per_member)}/phần · {freqLabel(group.frequency, h)}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-ink-100 overflow-x-auto">
        {DETAIL_TABS.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              subTab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{h[labelKey]}
          </button>
        ))}
      </div>

      {loading ? <div className="text-sm text-ink-400 py-8 text-center">…</div> : (
        <>
          {subTab === 'dashboard' && <DashboardPanel group={group} rounds={rounds} members={members} h={h} />}
          {subTab === 'members'   && <MembersPanel userId={userId} group={group} members={members} rounds={rounds} onRefresh={load} h={h} common={common} />}
          {subTab === 'rounds'    && <RoundsPanel  userId={userId} group={group} members={members} rounds={rounds} onRefresh={load} h={h} common={common} />}
          {subTab === 'payments'  && <PaymentsPanel userId={userId} group={group} members={members} rounds={rounds} h={h} common={common} />}
        </>
      )}
    </div>
  )
}

// ── Main HuiTab ───────────────────────────────────────────────────────────────

export default function HuiTab({ userId, h, common }) {
  const [selectedGroup, setSelectedGroup] = useState(null)

  if (selectedGroup) {
    return <GroupDetail userId={userId} group={selectedGroup} onBack={() => setSelectedGroup(null)} h={h} common={common} />
  }
  return <GroupsList userId={userId} h={h} common={common} onSelectGroup={setSelectedGroup} />
}
