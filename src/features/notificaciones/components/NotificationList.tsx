import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  BellSlash,
  Car,
  Bell,
  Lifebuoy,
  FileText,
  Trash,
  Check,
} from '@phosphor-icons/react'
import type { InAppNotification } from '@rocket-lease/contracts'
import { useMarkNotificaciones, useNotificaciones } from '../hooks/useNotificaciones'
import { fmt } from '@/lib/formatters'
import { EmptyState } from '@/ui/empty-state'
import { t } from '@/i18n/es'

const SWIPE_TRIGGER = 72
const TAP_TOLERANCE = 8

/** Ícono representativo según el deep-link de la notificación (fallback sin foto). */
function categoryIcon(url: string | null) {
  const props = { size: 22, weight: 'regular' as const, className: 'text-text-secondary' }
  if (url?.startsWith('/reservas')) return <Car {...props} />
  if (url?.startsWith('/soporte')) return <Lifebuoy {...props} />
  if (url?.startsWith('/perfil')) return <FileText {...props} />
  return <Bell {...props} />
}

/** Miniatura cuadrada: foto del vehículo si la hay, si no un ícono por categoría. */
function Thumbnail({ n }: { n: InAppNotification }) {
  const [errored, setErrored] = useState(false)
  if (n.imageUrl && !errored) {
    return (
      <img
        src={n.imageUrl}
        alt=""
        loading="lazy"
        onError={() => setErrored(true)}
        className="h-12 w-12 shrink-0 rounded-md object-cover"
      />
    )
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-2">
      {categoryIcon(n.url)}
    </span>
  )
}

function SwipeableNotification({
  n,
  onOpen,
  onRead,
  onDelete,
}: {
  n: InAppNotification
  onOpen: () => void
  onRead: () => void
  onDelete: () => void
}) {
  const [dx, setDx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const axis = useRef<'h' | 'v' | null>(null)
  const suppressClick = useRef(false)

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
    axis.current = null
    setAnimating(false)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const deltaX = e.clientX - start.current.x
    const deltaY = e.clientY - start.current.y
    if (axis.current === null && Math.abs(deltaX) + Math.abs(deltaY) > TAP_TOLERANCE) {
      axis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'h' : 'v'
    }
    if (axis.current !== 'h') return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDx(Math.sign(deltaX) * Math.min(Math.abs(deltaX), 140))
  }

  const onPointerUp = () => {
    start.current = null
    if (axis.current === null) return // tap puro → lo maneja onClick
    suppressClick.current = true // hubo arrastre: cancelar el click que sigue
    setAnimating(true)
    if (axis.current === 'h' && dx <= -SWIPE_TRIGGER) {
      setDx(-window.innerWidth) // sale por la izquierda y se elimina
      onDelete()
    } else if (axis.current === 'h' && dx >= SWIPE_TRIGGER) {
      setDx(0)
      if (!n.readAt) onRead()
    } else {
      setDx(0)
    }
  }

  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onOpen()
  }

  const revealingRead = dx > 0

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Capa de acción detrás de la fila */}
      <div
        className="absolute inset-0 flex items-center rounded-xl px-5"
        style={{
          backgroundColor: revealingRead ? 'var(--color-brand-500)' : 'var(--color-danger)',
          justifyContent: revealingRead ? 'flex-start' : 'flex-end',
          opacity: dx === 0 ? 0 : 1,
        }}
        aria-hidden="true"
      >
        {revealingRead ? (
          <Check size={20} weight="bold" className="text-white" />
        ) : (
          <Trash size={20} weight="bold" className="text-white" />
        )}
      </div>

      {/* Fila */}
      <div
        role="button"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        onPointerCancel={() => {
          start.current = null
          axis.current = null
          setAnimating(true)
          setDx(0)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        }}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animating ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
        className="relative flex items-center gap-3 rounded-xl bg-surface-1 px-3 py-3 text-left"
      >
        <Thumbnail n={n} />

        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className={n.readAt ? 'font-normal text-text-primary' : 'font-semibold text-text-primary'}>
            {n.body}
          </span>{' '}
          <span className="whitespace-nowrap text-text-muted">{fmt.relativeTime(n.createdAt)}</span>
        </p>

        {!n.readAt && (
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--color-brand-500)' }}
          />
        )}
        {!n.readAt && <span className="sr-only">{t('notificaciones.unread')}</span>}
      </div>
    </div>
  )
}

/**
 * Centro de notificaciones in-app: una línea por novedad con miniatura, deep-link
 * al tocar, swipe a la izquierda para eliminar y a la derecha para marcar leída.
 */
export function NotificationList() {
  const { data, isLoading, isError } = useNotificaciones()
  const { markRead, markAllRead, remove } = useMarkNotificaciones()
  const navigate = useNavigate()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const open = (n: InAppNotification) => {
    if (!n.readAt) markRead.mutate(n.id)
    if (n.url && n.url.startsWith('/')) void navigate({ to: n.url })
  }

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[72px] rounded-xl bg-surface-1 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<BellSlash size={26} weight="regular" className="text-text-muted" />}
        title={t('notificaciones.error')}
        description={t('notificaciones.errorHint')}
      />
    )
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellSlash size={26} weight="regular" className="text-text-muted" />}
        title={t('notificaciones.empty')}
        description={t('notificaciones.emptyHint')}
      />
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{t('notificaciones.recent')}</h2>
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
            <SwipeableNotification
              n={n}
              onOpen={() => open(n)}
              onRead={() =>
                markRead.mutate(n.id, {
                  onSuccess: () => toast.success(t('notificaciones.markedReadToast')),
                })
              }
              onDelete={() =>
                remove.mutate(n.id, {
                  onSuccess: () => toast.success(t('notificaciones.deletedToast')),
                })
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
