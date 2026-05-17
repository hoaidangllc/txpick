const CACHE_NAME = 'txpick-v5'
const APP_SHELL = ['/', '/today', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => undefined)
        return res
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
  )
})

self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data?.text?.() || '' }
  }

  const title = payload.title || 'TXPick Reminder'
  const targetUrl = payload.url || payload?.data?.url || '/reminders'
  const options = {
    body: payload.body || 'You have a reminder from TXPick.',
    tag: payload.tag || `txpick-reminder-${Date.now()}`,
    renotify: true,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    timestamp: Date.now(),
    data: { ...(payload.data || {}), url: targetUrl },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/today'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    })
  )
})
