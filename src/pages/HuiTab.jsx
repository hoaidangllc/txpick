import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Users, RotateCcw, CheckSquare, Square } from 'lucide-react'
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

function freqLabel(freq, h) {
  if (freq === 'weekly')   return h.freqWeekly
  if (freq === 'biweekly') return h.freqBiweekly
  return h.freqMonthly
}

function calcEndDate(startDate, memberCount, frequency) {
  if (!startDate || !memberCount) return null
  const d = new Date(startDate)
  const n = parseInt(memberCount) - 1
  if (n < 0) return null
  if (frequency === 'weekly')        d.setDate(d.getDate() + n * 7)
  else if (frequency === 'biweekly') d.setDate(d.getDate() + n * 14)
  else                               d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

// ── Selected Group Banner ─────────────────────────────────────────────────────

function GroupBanner({ group, onClear }) {
  if (!group) return null
  return (
    <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 mb-4">
      <div className="min-w-0">
        <span className="text-sm font-bold text-brand-800">{group.name}</span>
        <span className="text-xs text-brand-500 ml-2">
          <Users className="w-3 h-3 inline mr-0.5" />{group.member_count} · {fmtN(group.amount_per_member)}/phần
        </span>
      </div>
      <button onClick={onClear} className="text-xs text-brand-400 hover:text-brand-700 shrink-0 ml-2">✕</button>
    </div>
  )
}

// ── Tab 1: Groups ─────────────────────────────────────────────────────────────

const EMPTY_GROUP = { name: '', member_count: '', amount_per_member: '', start_date: '', frequency: 'monthly', status: 'active', active: true }

function GroupsTab({ userId, h, common, selected, onSelect }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_GROUP })

  const load = useCallback(async () => {
    setLoading(true)
    try { setGroups(await getHuiGroups(userId)) } finally { setLoading(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const endDate = calcEndDate(form.start_date, form.member_count, form.frequency)

  const handleSave = async () => {
    if (!form.name.trim()) return
    await upsertHuiGroup(userId, editing
      ? { ...form, id: editing.id, estimated_end_date: endDate }
      : { ...form, estimated_end_date: endDate })
    setShowForm(false); setEditing(null); setForm({ ...EMPTY_GROUP }); load()
  }

  const startEdit = (g) => {
    setEditing(g)
    setForm({ name: g.name, member_count: g.member_count, amount_per_member: g.amount_per_member,
      start_date: g.start_date || '', frequency: g.frequency, status: g.status || 'active', active: g.active })
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(h.confirmDelete)) return
    if (selected?.id === id) onSelect(null)
    await deleteHuiGroup(id); load()
  }

  return (
    <div className="space-y-3">
      {!showForm && !editing && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> {h.newGroup}
        </button>
      )}

      {(showForm || editing) && (
        <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
          <div className="text-sm font-bold text-ink-800">{editing ? h.editGroup : h.newGroup}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label-sm">{h.groupName}</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} />
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
          </div>
          {endDate && (
            <div className="text-xs text-ink-500">{h.estimatedEndDate}: <span className="font-semibold">{fmtDate(endDate)}</span></div>
          )}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={handleSave}>{common.save}</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditing(null) }}>{common.cancel}</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-sm text-ink-400 py-6 text-center">…</div>
        : groups.length === 0 ? <p className="text-sm text-ink-400 py-6 text-center">{h.noGroups}</p>
        : (
          <div className="space-y-2">
            {groups.map(g => {
              const isSelected = selected?.id === g.id
              return (
                <div key={g.id}
                  className={`rounded-xl border p-3 transition ${isSelected ? 'border-brand-400 bg-brand-50' : 'border-ink-100 bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button className="text-left min-w-0 flex-1" onClick={() => onSelect(isSelected ? null : g)}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-800 text-sm">{g.name}</span>
                        {isSelected && <span className="text-[10px] bg-brand-600 text-white rounded px-1.5 py-0.5 font-bold">✓</span>}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        <Users className="w-3 h-3 inline mr-0.5" />{g.member_count} · {fmtN(g.amount_per_member)}/phần · {freqLabel(g.frequency, h)}
                        {g.start_date && ` · ${fmtDate(g.start_date)}`}
                        {g.estimated_end_date && ` → ${fmtDate(g.estimated_end_date)}`}
                      </div>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <button className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => startEdit(g)}><Pencil className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-red-50 text-red-400" onClick={() => handleDelete(g.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}

// ── Tab 2: Members ────────────────────────────────────────────────────────────

const EMPTY_MEMBER = { name: '', phone: '', note: '', active: true, has_received_payout: false, payout_round: '', payout_date: '' }

function MembersTab({ userId, group, h, common }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_MEMBER })

  const load = useCallback(async () => {
    if (!group) return
    setLoading(true)
    try { setMembers(await getHuiMembers(userId, group.id)) } finally { setLoading(false) }
  }, [userId, group])

  useEffect(() => { load() }, [load])

  if (!group) return <p className="text-sm text-ink-400 py-8 text-center">{h.selectGroupFirst}</p>

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    const payload = {
      ...form,
      group_id: group.id,
      payout_round: form.payout_round ? parseInt(form.payout_round) : null,
      payout_date: form.payout_date || null,
    }
    await upsertHuiMember(userId, editing ? { ...payload, id: editing.id } : payload)
    setShowForm(false); setEditing(null); setForm({ ...EMPTY_MEMBER }); load()
  }

  const startEdit = (m) => {
    setEditing(m)
    setForm({ name: m.name, phone: m.phone || '', note: m.note || '', active: m.active,
      has_received_payout: m.has_received_payout, payout_round: m.payout_round || '', payout_date: m.payout_date || '' })
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(h.confirmDelete)) return
    await deleteHuiMember(id); load()
  }

  return (
    <div className="space-y-3">
      {!showForm && !editing && (
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(true)}>
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
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={handleSave}>{common.save}</button>
            <button className="btn-secondary text-sm" onClick={() => { setShowForm(false); setEditing(null) }}>{common.cancel}</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-sm text-ink-400 py-4 text-center">…</div>
        : members.length === 0 ? <p className="text-sm text-ink-400 py-4 text-center">{h.noMembers}</p>
        : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-ink-100 px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink-800 text-sm">{m.name}</span>
                    {m.has_received_payout && (
                      <span className="text-[10px] bg-green-50 text-green-700 rounded px-1.5 py-0.5 font-semibold">
                        ✓ {h.hasReceivedPayout}{m.payout_round ? ` kỳ ${m.payout_round}` : ''}
                      </span>
                    )}
                    {!m.active && <span className="text-[10px] bg-ink-100 text-ink-400 rounded px-1.5">off</span>}
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
            ))}
          </div>
        )}
    </div>
  )
}

// ── Tab 3: Current Round ──────────────────────────────────────────────────────

function CurrentRoundTab({ userId, group, h, common }) {
  const [members, setMembers] = useState([])
  const [rounds, setRounds]   = useState([])
  const [payments, setPayments] = useState([])   // for current round
  const [loading, setLoading]  = useState(true)
  const [showRoundForm, setShowRoundForm] = useState(false)
  const [roundForm, setRoundForm] = useState({ round_date: '', winner_member_id: '', bid_amount: '', notes: '' })

  const load = useCallback(async () => {
    if (!group) return
    setLoading(true)
    try {
      const [m, r] = await Promise.all([getHuiMembers(userId, group.id), getHuiRounds(userId, group.id)])
      setMembers(m); setRounds(r)
      if (r.length > 0) {
        const cur = r[r.length - 1]
        const p = await getHuiPayments(userId, group.id, cur.round_number)
        setPayments(p)
      } else { setPayments([]) }
    } finally { setLoading(false) }
  }, [userId, group])

  useEffect(() => { load() }, [load])

  if (!group) return <p className="text-sm text-ink-400 py-8 text-center">{h.selectGroupFirst}</p>

  const setRF = (k, v) => setRoundForm(f => ({ ...f, [k]: v }))

  const currentRound = rounds.length > 0 ? rounds[rounds.length - 1] : null
  const nextRoundNum = rounds.length + 1
  const paidMemberIds = new Set(rounds.map(r => r.winner_member_id).filter(Boolean))
  const unpaidForPayout = members.filter(m => m.active && !paidMemberIds.has(m.id))

  const gross = Number(group.member_count) * Number(group.amount_per_member)
  const bid   = parseFloat(roundForm.bid_amount) || 0
  const winnerReceive  = gross - bid
  const remainingCount = Math.max(unpaidForPayout.length - 1, 0)
  const bonusPerRemaining = remainingCount > 0 ? bid / remainingCount : 0

  const handleSaveRound = async () => {
    if (!roundForm.round_date || !roundForm.winner_member_id) return
    const winner = members.find(m => m.id === roundForm.winner_member_id)
    if (!winner) return window.alert('Please choose a valid winner.')

    try {
      await saveHuiRound(userId, {
        group_id: group.id,
        round_number: nextRoundNum,
        round_date: roundForm.round_date,
        winner_member_id: roundForm.winner_member_id,
        winner_name: winner?.name || '',
        bid_amount: bid,
        gross_pot: gross,
        winner_receive: winnerReceive,
        bonus_per_remaining: bonusPerRemaining,
        remaining_unpaid_count: remainingCount,
        notes: roundForm.notes,
      })

      // Mark winner as received payout
      await upsertHuiMember(userId, {
        ...winner, group_id: group.id,
        has_received_payout: true,
        payout_round: nextRoundNum,
        payout_date: roundForm.round_date,
      })

      // Auto-create payment records for all active members
      const payloads = members.filter(m => m.active).map(m => ({
        group_id: group.id,
        round_number: nextRoundNum,
        member_id: m.id,
        member_name: m.name,
        amount_due: Number(group.amount_per_member),
        amount_paid: 0,
        paid_date: null,
        status: 'unpaid',
      }))
      if (payloads.length > 0) await bulkInsertHuiPayments(userId, payloads)

      setShowRoundForm(false)
      setRoundForm({ round_date: '', winner_member_id: '', bid_amount: '', notes: '' })
      await load()
    } catch (err) {
      console.error('Save hui round failed:', err)
      window.alert(err?.message || 'Could not save hui round. Please check Supabase table/RLS.')
    }
  }

  // Toggle member payment in checklist (one-click)
  const togglePayment = async (p) => {
    const newStatus = p.status === 'paid' ? 'unpaid' : 'paid'
    const newPaid   = newStatus === 'paid' ? Number(group.amount_per_member) : 0
    await upsertHuiPayment(userId, {
      id: p.id,
      group_id: group.id,
      round_number: p.round_number,
      member_id: p.member_id,
      member_name: p.member_name,
      amount_due: p.amount_due,
      amount_paid: newPaid,
      paid_date: newStatus === 'paid' ? new Date().toISOString().slice(0, 10) : null,
      status: newStatus,
    })
    // Optimistic update
    setPayments(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus, amount_paid: newPaid } : x))
  }

  const paidPayments   = payments.filter(p => p.status === 'paid')
  const unpaidPayments = payments.filter(p => p.status !== 'paid')
  const totalCollected = paidPayments.reduce((a, p) => a + Number(p.amount_paid), 0)
  const totalMissing   = unpaidPayments.reduce((a, p) => a + Number(p.amount_due), 0)

  if (loading) return <div className="text-sm text-ink-400 py-8 text-center">…</div>

  return (
    <div className="space-y-4">
      {/* Current round info */}
      {currentRound ? (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-700">
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />{h.rounds} #{currentRound.round_number}  ·  {fmtDate(currentRound.round_date)}
            </span>
            <button
              onClick={() => setShowRoundForm(true)}
              className="text-[11px] bg-brand-600 text-white rounded px-2 py-0.5 font-semibold hover:bg-brand-700"
            >
              + {h.newRound}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-4 py-3 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">{h.winner}</span><span className="font-semibold text-ink-800">{currentRound.winner_name}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">{h.bidAmount}</span><span className="font-mono">{fmtN(currentRound.bid_amount)}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">{h.grossPot}</span><span className="font-mono">{fmtN(currentRound.gross_pot)}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">{h.winnerReceive}</span><span className="font-mono font-bold text-brand-700">{fmtN(currentRound.winner_receive)}</span></div>
          </div>
        </div>
      ) : (
        <div className="bg-ink-50 rounded-xl p-4 text-center">
          <p className="text-sm text-ink-500 mb-3">{h.noRounds}</p>
          <button className="btn-primary text-sm flex items-center gap-2 mx-auto" onClick={() => setShowRoundForm(true)}>
            <Plus className="w-4 h-4" /> {h.newRound}
          </button>
        </div>
      )}

      {/* New round form */}
      {showRoundForm && (
        <div className="bg-white rounded-xl border border-ink-100 p-4 space-y-3">
          <div className="text-sm font-bold text-ink-800">{h.newRound} #{nextRoundNum}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm">{h.roundDate}</label>
              <input className="input-field" type="date" value={roundForm.round_date} onChange={e => setRF('round_date', e.target.value)} />
            </div>
            <div>
              <label className="label-sm">{h.winner}</label>
              <select className="input-field" value={roundForm.winner_member_id} onChange={e => setRF('winner_member_id', e.target.value)}>
                <option value="">{h.selectWinner}</option>
                {unpaidForPayout.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm">{h.bidAmount}</label>
              <input className="input-field" type="number" value={roundForm.bid_amount} onChange={e => setRF('bid_amount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label-sm">{common.note}</label>
              <input className="input-field" value={roundForm.notes} onChange={e => setRF('notes', e.target.value)} />
            </div>
          </div>
          {roundForm.winner_member_id && (
            <div className="bg-ink-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-ink-400">{h.grossPot}</span><span className="font-mono">{fmtN(gross)}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">{h.winnerReceive}</span><span className="font-mono font-bold text-brand-700">{fmtN(winnerReceive)}</span></div>
              {bid > 0 && <div className="flex justify-between"><span className="text-ink-400">{h.bonusPerRemaining} (÷{remainingCount})</span><span className="font-mono text-green-700">{fmtN(bonusPerRemaining)}</span></div>}
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={handleSaveRound} disabled={!roundForm.round_date || !roundForm.winner_member_id}>{common.save}</button>
            <button className="btn-secondary text-sm" onClick={() => setShowRoundForm(false)}>{common.cancel}</button>
          </div>
        </div>
      )}

      {/* Payment checklist */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          {/* Summary bar */}
          <div className="grid grid-cols-4 border-b border-ink-100">
            {[
              { label: h.paidMembers,   value: paidPayments.length,   color: 'text-green-700' },
              { label: h.unpaidMembers, value: unpaidPayments.length,  color: 'text-red-500'   },
              { label: h.totalCollected, value: fmtN(totalCollected),  color: 'text-green-700' },
              { label: h.totalMissing,  value: fmtN(totalMissing),     color: 'text-red-500'   },
            ].map(({ label, value, color }) => (
              <div key={label} className="py-2 px-2 text-center border-r last:border-r-0 border-ink-100">
                <div className={`text-sm font-bold ${color}`}>{value}</div>
                <div className="text-[10px] text-ink-400 leading-tight">{label}</div>
              </div>
            ))}
          </div>

          {/* Member rows */}
          <div className="divide-y divide-ink-50">
            {payments.map(p => {
              const paid = p.status === 'paid'
              return (
                <button
                  key={p.id}
                  onClick={() => togglePayment(p)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-ink-50 ${paid ? 'bg-green-50/40' : ''}`}
                >
                  {paid
                    ? <CheckSquare className="w-5 h-5 text-green-600 shrink-0" />
                    : <Square     className="w-5 h-5 text-ink-300  shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${paid ? 'text-green-800' : 'text-ink-800'}`}>{p.member_name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-mono font-semibold ${paid ? 'text-green-700' : 'text-ink-400'}`}>
                      {fmtN(p.amount_due)}
                    </div>
                    {paid && p.paid_date && <div className="text-[10px] text-green-500">{fmtDate(p.paid_date)}</div>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Past rounds summary */}
      {rounds.length > 1 && (
        <details className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <summary className="px-4 py-3 text-xs font-bold text-ink-500 cursor-pointer select-none hover:text-ink-800">
            {h.history} ({rounds.length - 1})
          </summary>
          <div className="divide-y divide-ink-50">
            {[...rounds].reverse().slice(1).map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div>
                  <span className="text-xs font-bold text-brand-600 mr-2">#{r.round_number}</span>
                  <span className="font-medium text-ink-700">{r.winner_name}</span>
                  <span className="text-xs text-ink-400 ml-2">{fmtDate(r.round_date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-brand-700 font-semibold">{fmtN(r.winner_receive)}</span>
                  <button className="p-1 rounded hover:bg-red-50 text-red-300 hover:text-red-500"
                    onClick={async () => { if (!window.confirm(h.confirmDelete)) return; await deleteHuiRound(r.id); load() }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

// ── Main HuiTab ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'groups',  labelKey: 'groups',  icon: Users },
  { key: 'members', labelKey: 'members', icon: CheckCircle2 },
  { key: 'round',   labelKey: 'rounds',  icon: RotateCcw },
]

export default function HuiTab({ userId, h, common }) {
  const [tab, setTab]         = useState('groups')
  const [selected, setSelected] = useState(null)

  return (
    <div>
      {/* Group selector banner */}
      <GroupBanner group={selected} onClear={() => setSelected(null)} />

      {/* Tab bar */}
      <div className="flex border-b border-ink-100 mb-4 overflow-x-auto">
        {TABS.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Icon className="w-4 h-4" />{h[labelKey]}
          </button>
        ))}
      </div>

      {tab === 'groups'  && <GroupsTab  userId={userId} h={h} common={common} selected={selected} onSelect={setSelected} />}
      {tab === 'members' && <MembersTab userId={userId} group={selected} h={h} common={common} />}
      {tab === 'round'   && <CurrentRoundTab userId={userId} group={selected} h={h} common={common} />}
    </div>
  )
}
