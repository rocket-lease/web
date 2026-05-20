import { useNavigate } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/ui/button'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-8 bg-surface-0">
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
    )
  }

  return <>{children}</>
}
