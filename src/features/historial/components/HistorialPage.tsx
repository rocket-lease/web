import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ClockClockwise } from '@phosphor-icons/react'
import { CalendarDays, ArrowRight, User } from 'lucide-react'
import { type ReservationStatus, type ReservationRole } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useReservations } from '@/features/reservas/hooks/useReservations'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { EmptyState } from '@/ui/empty-state'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ReReservarButton } from '@/features/reservas/components/ReReservarButton'

const HISTORY_STATUSES: ReservationStatus[] = [
  'completed',
  'cancelled',
  'rejected',
  'expired',
]

const STATUS_CHIPS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: t('historial.filtros.todos') },
  { value: 'completed', label: t('reservas.estado.completed') },
  { value: 'cancelled', label: t('reservas.estado.cancelled') },
  { value: 'rejected', label: t('reservas.estado.rejected') },
  { value: 'expired', label: t('reservas.estado.expired') },
]

export function HistorialPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <PageHeader title={t('historial.title')} showBack />
      <HistorialView />
    </div>
  )
}

/**
 * Contenido del historial (estados terminales con filtros) sin chrome de página.
 * Se usa embebido dentro del centro de reservas (segmento "Historial") y como
 * cuerpo de la página `/historial`.
 */
export function HistorialView() {
  const { activeRole } = useAuth()
  const role: ReservationRole = activeRole === 'rentador' ? 'owner' : 'conductor'

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const statuses = useMemo(
    () => (statusFilter === 'all' ? HISTORY_STATUSES : [statusFilter]),
    [statusFilter],
  )

  const { data, isLoading, isError } = useReservations(
    {
      role,
      status: statuses,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize: 10,
    },
    { enabled: true },
  )

  const hasFilters = statusFilter !== 'all' || from || to

  return (
    <>
      <div className="px-4 pt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => { setStatusFilter(chip.value); setPage(1) }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === chip.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <DateRangeSheet
          value={{ from: from || undefined, to: to || undefined }}
          onApply={(range) => {
            setFrom(range.from ?? '')
            setTo(range.to ?? '')
            setPage(1)
          }}
          placeholder={t('historial.filtros.title')}
          title={t('historial.filtros.title')}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setFrom(''); setTo(''); setPage(1) }}>
            {t('historial.filtros.limpiar')}
          </Button>
        )}
      </div>

      <div className="flex-1 px-4 pt-4 space-y-3 pb-24">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-2 flex gap-3">
                <Skeleton className="h-20 w-20 shrink-0 rounded" />
                <div className="flex-1 flex flex-col gap-2 min-w-0 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-16 shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-text-muted">{t('historial.error')}</p>
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            icon={<ClockClockwise size={26} weight="regular" className="text-text-muted" />}
            title={t('historial.empty')}
          />
        )}

        {data?.items.map((item) => {
          const photo = item.vehicle.photo
          const counterpart = role === 'owner' ? item.conductor : item.rentador
          return (
            <Link
              key={item.id}
              to="/reservas/$id"
              params={{ id: item.id }}
              className="card p-2 flex gap-3 active:opacity-80"
            >
              <div className="h-20 w-20 shrink-0 rounded overflow-hidden bg-surface-2 flex items-center justify-center">
                {photo ? (
                  <img
                    src={photo}
                    alt={`${item.vehicle.brand} ${item.vehicle.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CalendarDays className="h-6 w-6 text-text-muted" />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-text-primary truncate">
                    {item.vehicle.brand} {item.vehicle.model}
                  </p>
                  <ReservaStatusBadge estado={item.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <CalendarDays className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="truncate">
                    <span className="font-semibold text-text-primary">{fmt.dayMonth(item.startAt)}</span>{' '}
                    {fmt.time(item.startAt)}
                    <ArrowRight className="inline h-3 w-3 mx-1 text-text-muted align-text-bottom" />
                    <span className="font-semibold text-text-primary">{fmt.dayMonth(item.endAt)}</span>{' '}
                    {fmt.time(item.endAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    <span className="truncate">{counterpart.name}</span>
                  </div>
                  <span className="font-bold text-brand-400 shrink-0 text-sm">
                    {fmt.currency(item.totalCents)}
                  </span>
                </div>

                {role === 'conductor' && item.status === 'completed' && (
                  <ReReservarButton reservationId={item.id} vehicleId={item.vehicle.id} />
                )}
              </div>
            </Link>
          )
        })}

        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('rentador.reservas.paginacion.anterior')}
            </Button>
            <span className="text-xs text-text-muted">
              {data.page} / {Math.ceil(data.total / data.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(data.total / data.pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('rentador.reservas.paginacion.siguiente')}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
