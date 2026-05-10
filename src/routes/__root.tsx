import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import { PWAUpdateToast } from '@/features/pwa/components/PWAUpdateToast'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <PWAUpdateToast />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-primary)',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
