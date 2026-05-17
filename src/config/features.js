export const FEATURES = {
  premium: false,
  aiAssistant: false,
  voiceAssistant: false,
  feedback: true,
}

export function isFeatureEnabled(key) {
  return Boolean(FEATURES[key])
}
