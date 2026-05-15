function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function emailLocal(email) {
  return clean(String(email || '').split('@')[0] || '').replace(/[._-]+/g, ' ')
}

export function authDisplayName(user) {
  const meta = user?.user_metadata || {}
  const identityData = user?.identities?.find((item) => item?.identity_data)?.identity_data || {}
  return clean(
    meta.full_name ||
    meta.name ||
    meta.display_name ||
    meta.preferred_name ||
    identityData.full_name ||
    identityData.name ||
    identityData.display_name ||
    identityData.preferred_name ||
    ''
  )
}

export function getUserDisplayName(user, profile = null) {
  const profileName = clean(profile?.display_name)
  if (profileName) return profileName
  const oauthName = authDisplayName(user)
  if (oauthName) return oauthName
  return emailLocal(user?.email)
}

export function isEmailFallbackName(value, user) {
  const name = clean(value).toLowerCase()
  if (!name) return true
  const local = emailLocal(user?.email).toLowerCase()
  const rawLocal = clean(String(user?.email || '').split('@')[0] || '').toLowerCase()
  return Boolean(local && (name === local || name === rawLocal))
}
