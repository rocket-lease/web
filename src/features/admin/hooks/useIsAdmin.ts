import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'

interface RoleHolder {
  app_metadata?: { role?: unknown } | null
  user_metadata?: { role?: unknown } | null
}

/**
 * Indica si el usuario autenticado es administrador. La fuente de verdad es
 * la columna `is_admin` que expone `GET /profile/me` — la misma que valida
 * `AdminGuard` en el backend — así la UI nunca diverge de lo que la API va a
 * autorizar. Mientras el perfil carga se usa el claim `role` del JWT de
 * Supabase como anticipo para no parpadear la navegación.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useMyProfile()

  const holder = user as unknown as RoleHolder | null
  const fromApp = holder?.app_metadata?.role
  const fromUser = holder?.user_metadata?.role
  const claimRole =
    typeof fromApp === 'string'
      ? fromApp
      : typeof fromUser === 'string'
        ? fromUser
        : null

  const isAdmin =
    profile?.isAdmin !== undefined ? profile.isAdmin : claimRole === 'admin'

  return {
    isAdmin: isAuthenticated && isAdmin,
    isLoading: isAuthLoading || isProfileLoading,
  }
}
