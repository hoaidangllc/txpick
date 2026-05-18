export const FEATURES = {
  premium: true,
  aiAssistant: false,
  voiceAssistant: false,
  feedback: true,
}

export function isFeatureEnabled(key) {
  return Boolean(FEATURES[key])
}
