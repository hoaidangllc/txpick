import webpush from 'web-push'

export function configureWebPush() {
  const publicKey = process.env.VITE_WEB_PUSH_PUBLIC_KEY || process.env.WEB_PUSH_PUBLIC_KEY
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const subject = process.env.WEB_PUSH_SUBJECT || 'mailto:support@txlife.app'
  if (!publicKey || !privateKey) throw new Error('Missing VITE_WEB_PUSH_PUBLIC_KEY/WEB_PUSH_PUBLIC_KEY or WEB_PUSH_PRIVATE_KEY')
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return webpush
}

export function cleanSubscription(subscription) {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return null
  return {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    expirationTime: subscription.expirationTime || null,
  }
}

export async function sendPush(subscription, payload) {
  const wp = configureWebPush()
  return wp.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60 })
}
