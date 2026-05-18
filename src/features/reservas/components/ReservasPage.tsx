import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, ClipboardList, Inbox, Loader2, User } from 'lucide-react'
import type {
  ReservationListItem,
  ReservationRole,
  ReservationStatus,
} from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { fetchReservations } from '../api/reservations.api'
import { useReservations } from '../hooks/useReservations'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { RoleSegmentedControl, RoleSegmentedControlSkeleton } from './RoleSegmentedControl'

type TabKey =
  | 'all'
  | 'solicitudes'
  | 'pending'
  | 'confirmed'
  | 'inProgress'
  | 'completed'
  | 'cancelled'

/** `undefined` = sin filtro de estado (el endpoint devuelve todas). */
const TAB_TO_STATUSES: Record<TabKey, ReservationStatus[] | undefined> = {
  all: undefined,
  solicitudes: ['pending_approval'],
  pending: ['pending_payment'],
  confirmed: ['confirmed'],
  inProgress: ['in_progress'],
  completed: ['completed'],
  cancelled: ['cancelled', 'rejected', 'expired'],
}

const TABS: ReadonlyArray<{ key: TabKey; labelKey: string }> = [
  { key: 'all', labelKey: 'reservas.tabs.todas' },
  { key: 'solicitudes', labelKey: 'reservas.tabs.solicitudes' },
  { key: 'pending', labelKey: 'reservas.tabs.pendientes' },
  { key: 'confirmed', labelKey: 'reservas.tabs.confirmadas' },
  { key: 'inProgress', labelKey: 'reservas.tabs.enCurso' },
  { key: 'completed', labelKey: 'reservas.tabs.completadas' },
  { key: 'cancelled', labelKey: 'reservas.tabs.canceladas' },
]

const PAGE_SIZE = 20

interface ReservasPageSearch {
  role?: ReservationRole
}

/**
 * Panel unificado de reservas. Si el usuario tiene vehículos publicados,
 * muestra un segmented control "Como conductor | Como rentador" para alternar
 * perspectiva; la selección se persiste en URL (`?role=owner|conductor`).
 *
 * El toggle es local a esta pantalla — no modifica `activeRole` global. La
 * UI global del switcher de rol es trabajo aparte (web#38).
 *
 * Optimización smart-cache: la primera request al endpoint trae todas las
 * reservas (sin filtro de estado). Si `total <= PAGE_SIZE` (caso común),
 * las demás tabs filtran client-side desde ese cache. Si tiene más, cada
 * tab dispara su propia request server-side.
 */
export function ReservasPage() {
  const navigate = useNavigate({ from: '/reservas' })
  const { role: roleSearch } = useSearch({
    from: '/_app/reservas',
  }) as ReservasPageSearch

  const myVehiclesQuery = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles(),
    staleTime: 60_000,
  })
  const isRentador =
    !!myVehiclesQuery.data && myVehiclesQuery.data.length > 0
  const role: ReservationRole =
    isRentador && roleSearch === 'owner' ? 'owner' : 'conductor'

  const [tab, setTab] = useState<TabKey>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const fromIso = from ? new Date(from).toISOString() : undefined
  const toIso = to ? new Date(to + 'T23:59:59').toISOString() : undefined

  /**
   * Esperamos a que `myVehiclesQuery` resuelva antes de disparar las queries
   * de reservas: si no, el primer render usa `role='conductor'` (default),
   * fetchea, y cuando `myVehicles` llega y el user es rentador con `?role=owner`
   * se dispara una segunda query — round-trip tirado.
   */
  const readyToFetch = myVehiclesQuery.isFetched

  const probeQuery = useReservations(
    {
      role,
      from: fromIso,
      to: toIso,
      page: 1,
      pageSize: PAGE_SIZE,
    },
    { enabled: readyToFetch },
  )

  /**
   * Conteo de solicitudes en estado `pending_approval` para el badge del header.
   * Para `role=owner` son solicitudes a aprobar; para `role=conductor` son las
   * que el usuario envió y esperan respuesta. Query dedicada con `pageSize=1`
   * (solo nos interesa `total`), cacheada por 30s.
   */
  const solicitudesCountQuery = useQuery({
    queryKey: ['reservationsCount', role, 'pending_approval'],
    queryFn: () =>
      fetchReservations({
        role,
        status: ['pending_approval'],
        page: 1,
        pageSize: 1,
      }),
    select: (response) => response.total,
    staleTime: 30_000,
    enabled: readyToFetch,
  })
  const solicitudesCount = solicitudesCountQuery.data ?? 0

  const allFitsInCache =
    !!(probeQuery.data && probeQuery.data.total <= PAGE_SIZE)
  const isProbeMatch = tab === 'all' && page === 1
  const canFilterFromCache = tab !== 'all' && allFitsInCache && page === 1
  const needsTabQuery = !isProbeMatch && !canFilterFromCache

  const tabQuery = useReservations(
    {
      role,
      status: TAB_TO_STATUSES[tab],
      from: fromIso,
      to: toIso,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: readyToFetch && needsTabQuery },
  )

  const data = (() => {
    if (isProbeMatch) return probeQuery.data
    if (canFilterFromCache) {
      const statuses = TAB_TO_STATUSES[tab]
      const items = (probeQuery.data?.items ?? []).filter(
        (r) => !statuses || statuses.includes(r.status),
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

  const isLoading =
    probeQuery.isLoading || (needsTabQuery && tabQuery.isLoading)
  const isRefetching =
    !isLoading &&
    (probeQuery.isFetching || (needsTabQuery && tabQuery.isFetching))
  const error = probeQuery.error || (needsTabQuery && tabQuery.error)

  const onTabChange = (next: TabKey) => {
    setTab(next)
    setPage(1)
  }

  const onRoleChange = (next: ReservationRole) => {
    navigate({
      search: (prev) => ({
        ...prev,
        role: next === 'owner' ? 'owner' : undefined,
      }),
    })
    setTab('all')
    setPage(1)
  }

  const sinVehiculos =
    role === 'owner' &&
    myVehiclesQuery.isFetched &&
    (myVehiclesQuery.data?.length ?? 0) === 0

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  const badgeLabel =
    role === 'owner'
      ? t('reservas.badge.solicitudes')
      : t('reservas.badge.enRevision')

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('reservas.title')}
        actions={
          solicitudesCount > 0 ? (
            <button
              type="button"
              onClick={() => onTabChange('solicitudes')}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm active:scale-[0.97]"
              aria-label={`${badgeLabel} (${solicitudesCount})`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>
                {badgeLabel} ({solicitudesCount})
              </span>
            </button>
          ) : undefined
        }
      />

      {!myVehiclesQuery.isFetched ? (
        <RoleSegmentedControlSkeleton />
      ) : isRentador ? (
        <RoleSegmentedControl value={role} onChange={onRoleChange} />
      ) : null}

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
          placeholder={t('reservas.filtros.placeholder')}
          title={t('reservas.filtros.title')}
        />
      </div>

      <div className="relative px-4 pb-6 flex flex-col gap-3">
        {isLoading && <ReservasListSkeleton />}
        {error && (
          <p className="text-sm text-danger-400 py-6 text-center">
            {t('reservas.error')}
          </p>
        )}
        {data && data.items.length === 0 && (
          <EmptyTab role={role} sinVehiculos={sinVehiculos} />
        )}
        {data && (
          <div
            className={
              isRefetching
                ? 'flex flex-col gap-3 opacity-50 pointer-events-none transition-opacity'
                : 'flex flex-col gap-3 transition-opacity'
            }
          >
            {data.items.map((reserva) => (
              <ReservaCard key={reserva.id} reserva={reserva} role={role} />
            ))}
          </div>
        )}
        {isRefetching && (
          <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
            <Loader2
              className="h-12 w-12 text-brand-400 animate-spin drop-shadow-lg"
              aria-label={t('reservas.cargando')}
            />
          </div>
        )}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="px-4 pb-8 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('reservas.paginacion.anterior')}
          </Button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('reservas.paginacion.siguiente')}
          </Button>
        </div>
      )}
    </div>
  )
}

interface ReservaCardProps {
  reserva: ReservationListItem
  role: ReservationRole
}

/**
 * Card de listado. La contraparte mostrada depende del rol: para conductor,
 * el rentador; para rentador, el conductor.
 */
function ReservaCard({ reserva, role }: ReservaCardProps) {
  const photo = reserva.vehicle.photo
  const counterpart = role === 'owner' ? reserva.conductor : reserva.rentador
  return (
    <Link
      to="/reservas/$id"
      params={{ id: reserva.id }}
      search={role === 'owner' ? { role: 'owner' } : {}}
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
            <span className="truncate">{counterpart.name}</span>
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

interface EmptyTabProps {
  role: ReservationRole
  sinVehiculos: boolean
}

function EmptyTab({ role, sinVehiculos }: EmptyTabProps) {
  if (role === 'owner') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <ClipboardList className="h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">
          {t(
            sinVehiculos
              ? 'reservas.empty.owner.sinVehiculos'
              : 'reservas.empty.owner.sinReservas',
          )}
        </p>
        {sinVehiculos && (
          <Link to="/mis-vehiculos/nuevo">
            <Button variant="default">{t('reservas.empty.owner.publicarCta')}</Button>
          </Link>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <ClipboardList className="h-12 w-12 text-text-muted" />
      <p className="text-text-secondary">
        {t('reservas.empty.conductor.sinReservas')}
      </p>
      <Link to="/buscar">
        <Button variant="secondary">{t('reservas.empty.conductor.cta')}</Button>
      </Link>
    </div>
  )
}
