import { useNavigate } from '@tanstack/react-router'
import { ShieldWarning } from '@phosphor-icons/react'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface AdminGateProps {
  children: React.ReactNode
}

/**
 * Restringe el árbol hijo a usuarios con rol `admin`. La fuente del rol es
 * `user.app_metadata.role` que viene firmado en el token de Supabase, por lo
 * que un usuario común no puede impostarlo desde el cliente.
 *
 * Mientras carga la sesión renderea `null`. Si el usuario no es admin muestra
 * un aviso explícito de acceso restringido (en vez de redirigir en silencio,
 * que dejaba al usuario sin saber qué pasó). El backend igual rechaza con
 * 403 ADMIN_FORBIDDEN como defensa en profundidad.
 */
export function AdminGate({ children }: AdminGateProps) {
  const { isAdmin, isLoading } = useIsAdmin()
  const navigate = useNavigate()

  if (isLoading) return null

  if (!isAdmin) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldWarning className="h-10 w-10 text-text-muted" weight="duotone" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-text-primary">
            {t('admin.gate.deniedTitle')}
          </p>
          <p className="text-sm text-text-muted">
            {t('admin.gate.deniedMessage')}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void navigate({ to: '/', replace: true })}
        >
          {t('admin.gate.backHome')}
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
