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
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
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
