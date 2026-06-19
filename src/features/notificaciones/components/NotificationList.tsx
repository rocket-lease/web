import { useNavigate } from '@tanstack/react-router'
import { BellSlash, CaretRight } from '@phosphor-icons/react'
import type { InAppNotification } from '@rocket-lease/contracts'
import { useMarkNotificaciones, useNotificaciones } from '../hooks/useNotificaciones'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

/**
 * Centro de notificaciones in-app: lista las novedades recibidas (incluso cuando
 * el push está deshabilitado), permite abrir el deep-link de cada una y marcarlas
 * como leídas de forma individual o en bloque.
 */
export function NotificationList() {
  const { data, isLoading, isError } = useNotificaciones()
  const { markRead, markAllRead } = useMarkNotificaciones()
  const navigate = useNavigate()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const handleOpen = (n: InAppNotification) => {
    if (!n.readAt) markRead.mutate(n.id)
    // Solo navegamos a paths internos; el backend siempre emite deep-links
    // relativos (`/reservas/...`, `/soporte/...`).
    if (n.url && n.url.startsWith('/')) void navigate({ to: n.url })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-surface-1 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-1">
          <BellSlash size={26} weight="regular" className="text-text-muted" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">{t('notificaciones.error')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('notificaciones.errorHint')}</p>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-1">
          <BellSlash size={26} weight="regular" className="text-text-muted" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">{t('notificaciones.empty')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('notificaciones.emptyHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">
          {t('notificaciones.recent')}
        </h2>
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {t('notificaciones.markAllRead')}
          </button>
        )}
      </div>

      <ul className="space-y-1.5">
        {notifications.map(n => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => handleOpen(n)}
              className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                n.readAt ? 'hover:bg-surface-1' : 'bg-surface-1/60 hover:bg-surface-1'
              }`}
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: n.readAt ? 'transparent' : 'var(--color-brand-500)' }}
              />
              {!n.readAt && <span className="sr-only">{t('notificaciones.unread')}</span>}
              {n.imageUrl && (
                <img
                  src={n.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${
                      n.readAt ? 'font-medium text-text-secondary' : 'font-semibold text-text-primary'
                    }`}
                  >
                    {n.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-text-muted">
                    {fmt.relativeTime(n.createdAt)}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-text-muted">{n.body}</span>
              </span>
              {n.url && (
                <CaretRight size={16} className="mt-1 shrink-0 text-text-muted" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
