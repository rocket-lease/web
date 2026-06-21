import { Link } from '@tanstack/react-router'
import { Bell } from '@phosphor-icons/react'
import { useUnreadNotificaciones } from '../hooks/useNotificaciones'
import { t } from '@/i18n/es'

/**
 * Botón de acceso al centro de notificaciones in-app. Cuando hay novedades sin
 * leer, la campana se muestra rellena y en blanco; cuando está todo leído, queda
 * en su estado neutro. Pensado para el slot `actions` del `PageHeader`.
 */
export function NotificationBell() {
  const { data: unread = 0 } = useUnreadNotificaciones()
  const hasUnread = unread > 0

  return (
    <Link
      to="/notificaciones"
      aria-label={
        hasUnread
          ? `${t('nav.notificaciones')}, ${unread} ${t('notificaciones.unread').toLowerCase()}`
          : t('nav.notificaciones')
      }
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 transition-colors active:scale-95 ${
        hasUnread ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      <Bell size={19} weight={hasUnread ? 'fill' : 'regular'} />
    </Link>
  )
}
