import { PLAN_KEYS, getPlanConfig, normalizePlanKey } from './plans.js'

export function getPlanFromProfile(profile) {
  if (!profile) return PLAN_KEYS.FREE
  if (profile.plan_key || profile.plan) return normalizePlanKey(profile.plan_key || profile.plan)
  if (profile.is_pro) return PLAN_KEYS.PRO
  return PLAN_KEYS.FREE
}

export function canRemoveAds(planKey) {
  return !getPlanConfig(planKey).ads
}

export function canShowAds(planKey) {
  return Boolean(getPlanConfig(planKey).ads)
}

export function canUseBusinessMode(planKey) {
  return Boolean(getPlanConfig(planKey).businessMode)
}

export function canUseTaxSummary(planKey) {
  return Boolean(getPlanConfig(planKey).taxSummary)
}

export function assistantDailyLimit(planKey) {
  return getPlanConfig(planKey).assistantDailyLimit
}

export function canUseAssistant(planKey, usedToday = 0) {
  const limit = assistantDailyLimit(planKey)
  return limit === Infinity || Number(usedToday || 0) < limit
}

export function isPlanLaunchingSoon(planKey) {
  return Boolean(getPlanConfig(planKey).launchingSoon)
}

export function featureLabel(featureKey, lang = 'vi') {
  const labels = {
    ads: { vi: 'Quảng cáo nhẹ', en: 'Light ads' },
    assistant: { vi: 'Smart Assistant', en: 'Smart Assistant' },
    businessMode: { vi: 'Business mode', en: 'Business mode' },
    taxSummary: { vi: 'Tax summary', en: 'Tax summary' },
  }
  return labels[featureKey]?.[lang] || labels[featureKey]?.en || featureKey
}
