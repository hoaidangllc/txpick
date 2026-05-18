export const PLAN_KEYS = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
}

export const APP_PLANS = {
  free: {
    key: PLAN_KEYS.FREE,
    price: 0,
    monthlyLabel: '$0',
    name: 'Free',
    viName: 'Miễn phí',
    ads: true,
    assistantDailyLimit: 3,
    businessMode: true,
    taxSummary: false,
    exportSummary: false,
    supportLevel: 'community',
  },
  plus: {
    key: PLAN_KEYS.PLUS,
    price: 1.99,
    monthlyLabel: '$1.99/mo',
    name: 'Plus',
    viName: 'Plus',
    ads: false,
    assistantDailyLimit: 15,
    businessMode: true,
    taxSummary: false,
    exportSummary: true,
    supportLevel: 'standard',
    launchingSoon: true,
  },
  pro: {
    key: PLAN_KEYS.PRO,
    price: 4.99,
    monthlyLabel: '$4.99/mo',
    name: 'Pro',
    viName: 'Pro',
    ads: false,
    assistantDailyLimit: 50,
    businessMode: true,
    taxSummary: true,
    exportSummary: true,
    supportLevel: 'priority',
    launchingSoon: true,
  },
}

export function normalizePlanKey(value) {
  return APP_PLANS[value] ? value : PLAN_KEYS.FREE
}

export function getPlanConfig(value = PLAN_KEYS.FREE) {
  return APP_PLANS[normalizePlanKey(value)]
}

export function getPlanLabel(value = PLAN_KEYS.FREE, lang = 'vi') {
  const plan = getPlanConfig(value)
  return lang === 'vi' ? plan.viName : plan.name
}

export function listPlans() {
  return [APP_PLANS.free, APP_PLANS.plus, APP_PLANS.pro]
}
