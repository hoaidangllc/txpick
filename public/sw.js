const CACHE_NAME = 'sh-life-ai-shell-v2'
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

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/today').then((res) => res || caches.match('/'))))
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200 && ['style', 'script', 'image', 'font'].includes(req.destination)) {
        const copy = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => null)
      }
      return res
    }).catch(() => cached))
  )
})

self.addEventListener('push', (event) => {
  let payload = { title: 'SH Life AI', body: 'You have something to review.' }
  try { payload = event.data?.json() || payload } catch {}
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || 'sh-life-ai',
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/today'))
})
