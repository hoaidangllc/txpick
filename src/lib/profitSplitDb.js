import { supabase } from './supabase.js'

// ── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfiles(userId) {
  const { data, error } = await supabase
    .from('profit_split_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertProfile(userId, profile) {
  const payload = { ...profile, user_id: userId }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('profit_split_profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProfile(id) {
  const { error } = await supabase
    .from('profit_split_profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── History ───────────────────────────────────────────────────────────────────

export async function saveHistory(userId, entry) {
  if (!userId) throw new Error('Missing user session. Please log in again.')

  const payload = {
    user_id: userId,
    profile_id: entry.profile_id || null,
    profile_name: entry.profile_name || null,
    quantity: Number(entry.quantity) || 0,
    gross_revenue: Number(entry.gross_revenue ?? entry.gross) || 0,
    base_cost: Number(entry.base_cost) || 0,
    partner_share: Number(entry.partner_share) || 0,
    commission_share: Number(entry.commission_share) || 0,
    my_share_percent: Number(entry.my_share_percent) || 0,
    my_gross_share: Number(entry.my_gross_share) || 0,
    net_profit: Number(entry.net_profit) || 0,
    currency: entry.currency || 'VND',
  }

  const { data, error } = await supabase
    .from('profit_split_history')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHistory(userId, { from, to, profileId } = {}) {
  let q = supabase
    .from('profit_split_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (from) q = q.gte('created_at', from)
  if (to)   q = q.lte('created_at', to)
  if (profileId) q = q.eq('profile_id', profileId)

  const { data, error } = await q
  if (error) throw error
  return data
}

export async function deleteHistoryEntry(id) {
  const { error } = await supabase
    .from('profit_split_history')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Hui Groups ────────────────────────────────────────────────────────────────

export async function getHuiGroups(userId) {
  const { data, error } = await supabase
    .from('hui_groups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertHuiGroup(userId, group) {
  const payload = { ...group, user_id: userId }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('hui_groups')
    .upsert(payload, { onConflict: 'id' })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteHuiGroup(id) {
  const { error } = await supabase.from('hui_groups').delete().eq('id', id)
  if (error) throw error
}

// ── Hui Members ───────────────────────────────────────────────────────────────

export async function getHuiMembers(userId, groupId) {
  const { data, error } = await supabase
    .from('hui_members')
    .select('*')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertHuiMember(userId, member) {
  const payload = { ...member, user_id: userId }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('hui_members')
    .upsert(payload, { onConflict: 'id' })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteHuiMember(id) {
  const { error } = await supabase.from('hui_members').delete().eq('id', id)
  if (error) throw error
}

// ── Hui Rounds ────────────────────────────────────────────────────────────────

export async function getHuiRounds(userId, groupId) {
  const { data, error } = await supabase
    .from('hui_rounds')
    .select('*')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .order('round_number', { ascending: true })
  if (error) throw error
  return data
}

export async function saveHuiRound(userId, round) {
  if (!userId) throw new Error('Missing user session. Please log in again.')

  // Keep the payload aligned with the real Supabase hui_rounds schema.
  // Do not spread UI-only fields into the insert, because Supabase rejects
  // unknown columns and the save appears to do nothing.
  const payload = {
    user_id: userId,
    group_id: round.group_id,
    round_number: Number(round.round_number) || 1,
    round_date: round.round_date,
    winner_member_id: round.winner_member_id || null,
    winner_name: round.winner_name || '',
    bid_amount: Number(round.bid_amount) || 0,
    gross_pot: Number(round.gross_pot) || 0,
    winner_receive: Number(round.winner_receive) || 0,
    bonus_per_remaining: Number(round.bonus_per_remaining ?? round.bonus_per_remaining_member) || 0,
    remaining_unpaid_count: Number(round.remaining_unpaid_count) || 0,
    notes: round.notes || null,
  }

  const { data, error } = await supabase
    .from('hui_rounds')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHuiRound(id) {
  const { error } = await supabase.from('hui_rounds').delete().eq('id', id)
  if (error) throw error
}

// ── Hui Payments ──────────────────────────────────────────────────────────────

export async function getHuiPayments(userId, groupId, roundNumber) {
  let q = supabase
    .from('hui_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .order('member_name', { ascending: true })
  if (roundNumber != null) q = q.eq('round_number', roundNumber)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function upsertHuiPayment(userId, payment) {
  const payload = { ...payment, user_id: userId }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('hui_payments')
    .upsert(payload, { onConflict: 'id' })
    .select().single()
  if (error) throw error
  return data
}

export async function bulkInsertHuiPayments(userId, payments) {
  const payload = payments.map(p => ({ ...p, user_id: userId }))
  const { data, error } = await supabase
    .from('hui_payments')
    .insert(payload)
    .select()
  if (error) throw error
  return data
}
