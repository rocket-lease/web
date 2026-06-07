import { useAuth } from '@/features/auth/hooks/useAuth'

interface RoleHolder {
  app_metadata?: { role?: unknown } | null
  user_metadata?: { role?: unknown } | null
}

/**
 * Indica si el usuario autenticado tiene rol `admin` leyendo
 * `user.app_metadata.role` (firmado en el JWT de Supabase). El backend
 * revalida el rol en cada request via `AdminGuard`, por lo que esto solo
 * gobierna la visibilidad en UI.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { user, isLoading, isAuthenticated } = useAuth()
  const holder = user as unknown as RoleHolder | null
  const fromApp = holder?.app_metadata?.role
  const fromUser = holder?.user_metadata?.role
  const role =
    typeof fromApp === 'string'
      ? fromApp
      : typeof fromUser === 'string'
        ? fromUser
        : null
  return { isAdmin: isAuthenticated && role === 'admin', isLoading }
}
