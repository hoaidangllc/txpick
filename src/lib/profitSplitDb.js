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
  const { data, error } = await supabase
    .from('profit_split_history')
    .insert({ ...entry, user_id: userId })
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
  const { data, error } = await supabase
    .from('hui_rounds')
    .insert({ ...round, user_id: userId })
    .select().single()
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
