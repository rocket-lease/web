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
    deps: {
      optimizer: {
        web: {
          exclude: ['@phosphor-icons/react'],
        },
      },
    },
  },
})
