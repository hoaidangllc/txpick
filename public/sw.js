const CACHE_NAME = 'txpick-life-shell-v1'
const SHELL = ['/', '/today', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(() => null))
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
  event.respondWith(fetch(req).catch(() => caches.match(req).then((res) => res || caches.match('/'))))
})

self.addEventListener('push', (event) => {
  let payload = { title: 'TxPick Reminder', body: 'You have a reminder.' }
  try { payload = event.data?.json() || payload } catch {}
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || 'txpick-reminder',
  }))
})
