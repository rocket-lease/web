import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, ClipboardList, Loader2, User } from 'lucide-react'
import type {
  ReservationListItem,
  ReservationStatus,
} from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { useOwnerReservations } from '../hooks/useOwnerReservations'

type TabKey = 'all' | 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled'

// `undefined` = sin filtro de estado (el endpoint devuelve todas).
const TAB_TO_STATUSES: Record<TabKey, ReservationStatus[] | undefined> = {
  all: undefined,
  pending: ['pending_payment'],
  confirmed: ['confirmed'],
  inProgress: ['in_progress'],
  completed: ['completed'],
  cancelled: ['cancelled', 'rejected', 'expired'],
}

const TABS: ReadonlyArray<{ key: TabKey; labelKey: string }> = [
  { key: 'all', labelKey: 'rentador.reservas.tabs.todas' },
  { key: 'pending', labelKey: 'rentador.reservas.tabs.pendientes' },
  { key: 'confirmed', labelKey: 'rentador.reservas.tabs.confirmadas' },
  { key: 'inProgress', labelKey: 'rentador.reservas.tabs.enCurso' },
  { key: 'completed', labelKey: 'rentador.reservas.tabs.completadas' },
  { key: 'cancelled', labelKey: 'rentador.reservas.tabs.canceladas' },
]

const PAGE_SIZE = 20

/**
 * Panel del rentador con todas sus reservas, organizadas en tabs por estado
 * (Todas, Pendientes, Confirmadas, En curso, Completadas, Canceladas) y con
 * filtro de rango de fechas via bottom sheet.
 *
 * Optimización smart-cache: la primera request al endpoint trae todas las
 * reservas (sin filtro de estado). Si el rentador tiene `total <= PAGE_SIZE`
 * (caso común), las demás tabs filtran client-side desde ese cache sin
 * round-trips adicionales. Si tiene más, cada tab dispara su propia request
 * server-side.
 *
 * Empty state diferenciado: si no hay reservas Y el rentador tampoco tiene
 * vehículos publicados, sugiere publicar uno con CTA. Si tiene vehículos
 * pero 0 reservas en la tab activa, mostrar copy genérico.
 */
export function PanelReservasRentadorPage() {
  const [tab, setTab] = useState<TabKey>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const fromIso = from ? new Date(from).toISOString() : undefined
  const toIso = to ? new Date(to + 'T23:59:59').toISOString() : undefined

  const probeQuery = useOwnerReservations({
    status: undefined,
    from: fromIso,
    to: toIso,
    page: 1,
    pageSize: PAGE_SIZE,
  })

  const allFitsInCache = !!(probeQuery.data && probeQuery.data.total <= PAGE_SIZE)
  const isProbeMatch = tab === 'all' && page === 1
  const canFilterFromCache = tab !== 'all' && allFitsInCache && page === 1
  const needsTabQuery = !isProbeMatch && !canFilterFromCache

  const tabQuery = useOwnerReservations(
    {
      status: TAB_TO_STATUSES[tab],
      from: fromIso,
      to: toIso,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: needsTabQuery },
  )

  const data = (() => {
    if (isProbeMatch) return probeQuery.data
    if (canFilterFromCache) {
      const statuses = TAB_TO_STATUSES[tab]
      const items = (probeQuery.data?.items ?? []).filter((r) =>
        !statuses || statuses.includes(r.status),
      )
      return {
        items,
        page: 1,
        pageSize: PAGE_SIZE,
        total: items.length,
      }
    }
    return tabQuery.data
  })()

  const reservasVacias = !!data && data.items.length === 0
  const myVehiclesQuery = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles(),
    enabled: reservasVacias,
    staleTime: 60_000,
  })
  const sinVehiculos = !!myVehiclesQuery.data && myVehiclesQuery.data.length === 0

  const isLoading = probeQuery.isLoading || (needsTabQuery && tabQuery.isLoading)
  const isRefetching =
    !isLoading &&
    (probeQuery.isFetching || (needsTabQuery && tabQuery.isFetching))
  const error = probeQuery.error || (needsTabQuery && tabQuery.error)

  const onTabChange = (next: TabKey) => {
    setTab(next)
    setPage(1)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div className="flex flex-col">
      <PageHeader title={t('rentador.reservas.title')} />

      <div className="px-4 pt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {TABS.map((definition) => (
            <button
              key={definition.key}
              type="button"
              onClick={() => onTabChange(definition.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === definition.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              {t(definition.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <DateRangeSheet
          value={{ from, to }}
          onApply={(range) => {
            setFrom(range.from ?? '')
            setTo(range.to ?? '')
            setPage(1)
          }}
          placeholder={t('rentador.reservas.filtros.placeholder')}
          title={t('rentador.reservas.filtros.title')}
        />
      </div>

      <div className="relative px-4 pb-6 flex flex-col gap-3">
        {isLoading && <ReservasListSkeleton />}
        {error && (
          <p className="text-sm text-danger-400 py-6 text-center">
            {t('rentador.reservas.error')}
          </p>
        )}
        {data && data.items.length === 0 && <EmptyTab sinVehiculos={sinVehiculos} />}
        {data && (
          <div
            className={
              isRefetching
                ? 'flex flex-col gap-3 opacity-50 pointer-events-none transition-opacity'
                : 'flex flex-col gap-3 transition-opacity'
            }
          >
            {data.items.map((reserva) => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        )}
        {isRefetching && (
          <Loader2
            className="absolute top-2 right-4 h-5 w-5 text-text-muted animate-spin"
            aria-label={t('rentador.reservas.cargando')}
          />
        )}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="px-4 pb-8 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('rentador.reservas.paginacion.anterior')}
          </Button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('rentador.reservas.paginacion.siguiente')}
          </Button>
        </div>
      )}
    </div>
  )
}

function ReservaCard({ reserva }: { reserva: ReservationListItem }) {
  const photo = reserva.vehicle.photo
  return (
    <Link
      to="/rentador/reservas/$id"
      params={{ id: reserva.id }}
      className="card p-2 flex gap-3 active:opacity-80"
    >
      <div className="h-20 w-20 shrink-0 rounded overflow-hidden bg-surface-2 flex items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt={`${reserva.vehicle.brand} ${reserva.vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <CalendarDays className="h-6 w-6 text-text-muted" />
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-text-primary truncate">
            {reserva.vehicle.brand} {reserva.vehicle.model}
          </p>
          <ReservaStatusBadge estado={reserva.status} />
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <CalendarDays className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="truncate">
            <span className="font-semibold text-text-primary">
              {fmt.dayMonth(reserva.startAt)}
            </span>{' '}
            {fmt.time(reserva.startAt)}
            <ArrowRight className="inline h-3 w-3 mx-1 text-text-muted align-text-bottom" />
            <span className="font-semibold text-text-primary">
              {fmt.dayMonth(reserva.endAt)}
            </span>{' '}
            {fmt.time(reserva.endAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span className="truncate">{reserva.conductor.name}</span>
          </div>
          <span className="font-bold text-brand-400 shrink-0 text-sm">
            {fmt.currency(reserva.totalCents)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function ReservasListSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </>
  )
}

function EmptyTab({ sinVehiculos }: { sinVehiculos: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <ClipboardList className="h-12 w-12 text-text-muted" />
      <p className="text-text-secondary">
        {t(
          sinVehiculos
            ? 'rentador.reservas.empty.sinVehiculos'
            : 'rentador.reservas.empty.sinReservas',
        )}
      </p>
      {sinVehiculos && (
        <Link to="/mis-vehiculos/nuevo">
          <Button variant="default">{t('rentador.reservas.empty.publicarCta')}</Button>
        </Link>
      )}
    </div>
  )
}
