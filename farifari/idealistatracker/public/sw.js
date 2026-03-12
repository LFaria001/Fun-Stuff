const CACHE = 'idealista-v1'
const BASE = '/farifari/idealistatracker/'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([BASE, BASE + 'manifest.json', BASE + 'icon.svg']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) {
          const clone = r.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return r
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match(BASE)))
  )
})
