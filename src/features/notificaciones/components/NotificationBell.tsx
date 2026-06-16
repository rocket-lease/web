import { Link } from '@tanstack/react-router'
import { Bell } from '@phosphor-icons/react'
import { useUnreadNotificaciones } from '../hooks/useNotificaciones'
import { t } from '@/i18n/es'

/**
 * Botón de acceso al centro de notificaciones in-app con un badge que muestra la
 * cantidad de notificaciones no leídas. Pensado para el slot `actions` del
 * `PageHeader` de las pantallas principales.
 */
export function NotificationBell() {
  const { data: unread = 0 } = useUnreadNotificaciones()

  return (
    <Link
      to="/notificaciones"
      aria-label={
        unread > 0
          ? `${t('nav.notificaciones')}, ${unread} ${t('notificaciones.unread').toLowerCase()}`
          : t('nav.notificaciones')
      }
      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
    >
      <Bell size={22} />
      {unread > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
          style={{ backgroundColor: 'var(--color-danger)' }}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
