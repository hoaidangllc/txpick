export function authRedirectUrl(path = '/auth/callback') {
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

export function nextAppRoute(profile) {
  if (profile?.type === 'business') return '/business'
  if (profile?.type === 'personal') return '/today'
  return '/onboarding'
}
