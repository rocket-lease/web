import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface AdminGateProps {
  children: React.ReactNode
}

/**
 * Restringe el árbol hijo a usuarios con rol `admin`. La fuente del rol es
 * `user.app_metadata.role` que viene firmado en el token de Supabase, por lo
 * que un usuario común no puede impostarlo desde el cliente.
 *
 * Mientras carga la sesión renderea `null` y, si el usuario no es admin o no
 * está autenticado, redirige a la home como medida de defensa en profundidad
 * (el backend igual rechaza con 403 ADMIN_FORBIDDEN).
 */
export function AdminGate({ children }: AdminGateProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const role = readRole(user as unknown as RoleHolder | null)
  const isAdmin = isAuthenticated && role === 'admin'

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin) {
      void navigate({ to: '/', replace: true })
    }
  }, [isLoading, isAdmin, navigate])

  if (isLoading || !isAdmin) return null
  return <>{children}</>
}

interface RoleHolder {
  app_metadata?: { role?: unknown } | null
  user_metadata?: { role?: unknown } | null
}

function readRole(user: RoleHolder | null): string | null {
  if (!user) return null
  const fromApp = user.app_metadata?.role
  if (typeof fromApp === 'string') return fromApp
  const fromUser = user.user_metadata?.role
  if (typeof fromUser === 'string') return fromUser
  return null
}
