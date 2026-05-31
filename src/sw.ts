/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Workbox inyecta el manifest de precache acá en build time
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// skipWaiting + clientsClaim para autoUpdate
self.skipWaiting()
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// Runtime caching
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/'),
  new NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 10 }),
)
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/'),
  new StaleWhileRevalidate({ cacheName: 'image-cache' }),
)
registerRoute(
  ({ url }) => ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname),
  new CacheFirst({ cacheName: 'font-cache' }),
)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  }),
)

// ─── Push Notifications ────────────────────────────────────────────────────

self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json() as {
    title?: string
    body?: string
    icon?: string
    badge?: string
    data?: { url?: string }
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Rocket Lease', {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192.png',
      badge: data.badge ?? '/icons/badge-72.png',
      data: data.data ?? {},
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url: string = (event.notification.data as { url?: string }).url ?? '/'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            return (client as WindowClient).focus().then(c => c.navigate(url))
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})
