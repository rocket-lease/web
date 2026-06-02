import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Sustituye el cliente de Supabase por un stub que no abre conexiones reales
      '@supabase/supabase-js': path.resolve(__dirname, './src/test/supabase-stub.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test_key',
      VITE_API_URL: 'http://localhost:3000',
    },
    deps: {
      optimizer: {
        web: {
          exclude: ['@phosphor-icons/react'],
        },
      },
    },
  },
})
