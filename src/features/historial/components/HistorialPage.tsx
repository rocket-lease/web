import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ClockClockwise } from '@phosphor-icons/react'
import { ChevronRight } from 'lucide-react'
import { type ReservationStatus } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useReservations } from '@/features/reservas/hooks/useReservations'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { DateRangeSheet } from '@/ui/date-range-sheet'

const HISTORY_STATUSES: ReservationStatus[] = [
  'completed',
  'cancelled',
  'rejected',
  'expired',
]

export function HistorialPage() {
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
      role: 'owner',
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
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <PageHeader
        title={t('historial.title')}
        showBack
        icon={<ClockClockwise size={20} weight="regular" />}
      />

      <div className="px-4 pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as ReservationStatus | 'all'); setPage(1) }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t('historial.filtros.estado')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('historial.filtros.todos')}</SelectItem>
              <SelectItem value="completed">{t('reservas.estado.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('reservas.estado.cancelled')}</SelectItem>
              <SelectItem value="rejected">{t('reservas.estado.rejected')}</SelectItem>
              <SelectItem value="expired">{t('reservas.estado.expired')}</SelectItem>
            </SelectContent>
          </Select>

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
      </div>

      <div className="flex-1 px-4 pt-4 space-y-3 pb-24">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-text-muted">{t('historial.error')}</p>
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClockClockwise size={40} className="text-white/10 mb-3" />
            <p className="text-sm text-text-primary font-medium">
              {t('historial.empty')}
            </p>
          </div>
        )}

        {data?.items.map((item) => (
          <Link
            key={item.id}
            to="/reservas/$id"
            params={{ id: item.id }}
            className="block bg-surface-1 rounded-xl p-4 active:opacity-80 transition-opacity"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ReservaStatusBadge estado={item.status} />
                  <span className="text-xs text-text-muted">
                    {fmt.dateShort(item.startAt)}
                  </span>
                </div>

                <p className="text-sm text-text-primary font-medium truncate">
                  {item.vehicle.brand} {item.vehicle.model}
                </p>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>{fmt.plate(item.vehicle.plate)}</span>
                  <span className="text-white/10">·</span>
                  <span>{item.conductor.name}</span>
                </div>

                <p className="text-sm font-semibold text-text-primary">
                  {fmt.currency(item.totalCents)}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-text-muted mt-1 shrink-0" />
            </div>
          </Link>
        ))}

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
    </div>
  )
}
