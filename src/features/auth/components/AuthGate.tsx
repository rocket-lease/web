import { useNavigate } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, isLoading } = useAuth()
  const hasToken = Boolean(localStorage.getItem('rocket_lease:access_token'))
  const navigate = useNavigate()

  if (isLoading) return null

  if (!user && !hasToken) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Skeleton background */}
        <div className="pointer-events-none select-none px-4 pt-6 space-y-4 blur-sm opacity-60">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-20 flex-1 rounded-xl" />
            <Skeleton className="h-20 flex-1 rounded-xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 bg-surface-0/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-white/8">
              <LogIn className="h-7 w-7 text-brand-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-bold text-text-primary">Iniciá sesión para continuar</p>
              <p className="text-sm text-text-muted leading-relaxed">
                Necesitás una cuenta para acceder a esta sección.
              </p>
            </div>
            <Button
              className="w-full max-w-xs"
              size="lg"
              onClick={() => navigate({ to: '/login' })}
            >
              Ir al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
