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

// El Badging API (setAppBadge) sí está soportado en PWAs instaladas en iOS 16.4+,
// a diferencia de la mayoría de las propiedades ricas de la notificación. Refleja
// el conteo de no leídas en el ícono de la app.
function syncAppBadge(unreadCount?: number) {
  const nav = self.navigator as WorkerNavigator & {
    setAppBadge?: (count?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
  if (typeof unreadCount !== 'number') return
  if (unreadCount > 0) void nav.setAppBadge?.(unreadCount)
  else void nav.clearAppBadge?.()
}

self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json() as {
    title?: string
    body?: string
    icon?: string
    badge?: string
    tag?: string
    requireInteraction?: boolean
    unreadCount?: number
    data?: { url?: string }
  }
  syncAppBadge(data.unreadCount)
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Rocket Lease', {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192.png',
      badge: data.badge ?? '/icons/badge-72.png',
      tag: data.tag,
      requireInteraction: data.requireInteraction ?? false,
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
            // En WebKit (iOS 17/18) navigate() sobre un cliente existente es lo que
            // efectivamente cambia de ruta; focus() solo, deja la página anterior.
            const wc = client as WindowClient
            return wc.navigate(url).then(c => (c ?? wc).focus())
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})
