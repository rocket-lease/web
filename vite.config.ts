import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [
    // Resolves @rocket-lease/contracts → ../contracts/src/index.ts via tsconfig
    // paths. See ../api/docs/adr/0007-contracts-as-source.md.
    tsconfigPaths(),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      // autoUpdate + skipWaiting + clientsClaim: cuando hay una versión nueva
      // el SW se instala y toma control sin pedir confirmación. Sin esto, el
      // PWA instalado queda corriendo el bundle viejo aunque deployees fixes.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Rocket Lease',
        short_name: 'RocketLease',
        description: 'Alquilá el vehículo que necesitás',
        theme_color: '#6C3BE2',
        background_color: '#0f0b1a',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: { maxAgeSeconds: 31536000, maxEntries: 10 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-day-picker', 'date-fns', 'date-fns/locale'],
  },
  server: {
    allowedHosts: ['dreamy-anyplace-zebra.ngrok-free.dev'],
    // Proxy de la API en desarrollo: el front llama a `/api/*` (mismo origen,
    // sin CORS ni mixed-content) y Vite lo reenvía al backend local. Permite
    // usar la app desde el celular vía un único túnel ngrok (el del front).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
    fs: {
      // Vite refuses to serve files outside the project root by default.
      // Allow the sibling contracts/ folder so its TS source can be imported.
      allow: [
        path.resolve(__dirname, './'),
        path.resolve(__dirname, '../contracts'),
      ],
    },
  },
})
