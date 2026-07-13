const CACHE = 'certara-v1'
const STATIC = ['/manifest.json', '/favicon.svg', '/icons/icon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  // Only cache GET requests for same-origin assets; let API calls pass through
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/generate')) return

  e.respondWith(
    caches.match(e.request).then((cached) => cached ?? fetch(e.request)),
  )
})
