// VIT Grocery Service Worker
const CACHE_NAME = 'vit-grocery-v1'
const STATIC_ASSETS = [
  '/',
  '/products',
  '/cart',
  '/login',
  '/signup',
  '/manifest.json',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently fail for assets that can't be cached
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: Network-first for API, Cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests (always fresh)
  if (url.pathname.startsWith('/api/')) return

  // Skip NextAuth routes
  if (url.pathname.startsWith('/auth/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // Return offline fallback for navigation
          if (request.mode === 'navigate') {
            return caches.match('/').then(r => r || new Response('Offline - Please check your connection', { status: 503 }))
          }
          return new Response('Network unavailable', { status: 503 })
        })
      })
  )
})

// Background Sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  // Sync any pending offline orders when back online
  const cache = await caches.open(CACHE_NAME)
  const keys = await cache.keys()
  const offlineOrders = keys.filter(k => k.url.includes('offline-order'))
  // Process offline orders...
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'VIT Grocery', {
      body: data.body || 'You have an update',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'View Order' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow(event.notification.data?.url || '/orders'))
  }
})
