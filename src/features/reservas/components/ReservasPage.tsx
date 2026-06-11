import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowRight, CalendarDays, Check, ClipboardList, Clock, Inbox, Loader2, User, X } from 'lucide-react'
import { Bell } from '@phosphor-icons/react'
import {
  RESERVATION_STATUS,
  type ReservationListItem,
  type ReservationRole,
  type ReservationStatus,
} from '@rocket-lease/contracts'
import { collapseChain } from '../utils/chain'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { fetchReservations } from '../api/reservations.api'
import { useReservations } from '../hooks/useReservations'
import { useReReservar } from '@/features/reservar/hooks/useReReservar'
import { useApproveReservation } from '../hooks/useApproveReservation'
import { useRejectReservation } from '../hooks/useRejectReservation'
import { useUnreadCount } from '@/features/chat/hooks/useUnreadCount'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { ConfirmationModal } from './modals/ConfirmationModal'
import { RejectReasonModal } from './modals/RejectReasonModal'

type TabKey =
  | 'all'
  | 'solicitudes'
  | 'pending'
  | 'pendingBalance'
  | 'confirmed'
  | 'inProgress'
  | 'completed'

/**
 * Mapea cada tab a los estados que filtra. Es role-aware para `pending_balance`
 * (reservas señadas, US-26): el conductor las ve en su propio tab "Pendientes
 * de saldo" (accionable), mientras que para el rentador se agrupan bajo
 * "Confirmadas" (no requieren acción suya). `undefined` = sin filtro.
 */
function getTabStatuses(
  tab: TabKey,
  role: ReservationRole,
): ReservationStatus[] | undefined {
  switch (tab) {
    case 'all':
      return undefined
    case 'solicitudes':
      return [RESERVATION_STATUS.pending_approval]
    case 'pending':
      return [RESERVATION_STATUS.pending_payment]
    case 'pendingBalance':
      return [RESERVATION_STATUS.pending_balance]
    case 'confirmed':
      return role === 'owner'
        ? [RESERVATION_STATUS.confirmed, RESERVATION_STATUS.pending_balance]
        : [RESERVATION_STATUS.confirmed]
    case 'inProgress':
      return [RESERVATION_STATUS.in_progress]
    case 'completed':
      return [RESERVATION_STATUS.completed]
  }
}

/**
 * El label de cada tab puede variar según el rol (ej. `pending_approval`:
 * para el rentador son "Solicitudes" que llegan a aprobar; para el
 * conductor son sus propias solicitudes "En revisión" esperando rta).
 */
function getTabs(role: ReservationRole): ReadonlyArray<{ key: TabKey; label: string }> {
  return [
    { key: 'all', label: t('reservas.tabs.todas') },
    {
      key: 'solicitudes',
      label:
        role === 'owner'
          ? t('reservas.tabs.solicitudes')
          : t('reservas.tabs.enRevision'),
    },
    { key: 'pending', label: t('reservas.tabs.pendientes') },
    // US-26/US-30: las reservas señadas son accionables solo por el conductor.
    ...(role === 'conductor'
      ? [{ key: 'pendingBalance' as TabKey, label: t('reservas.tabs.pendientesSaldo') }]
      : []),
    { key: 'confirmed', label: t('reservas.tabs.confirmadas') },
    { key: 'inProgress', label: t('reservas.tabs.enCurso') },
    { key: 'completed', label: t('reservas.tabs.completadas') },
  ]
}

const PAGE_SIZE = 20

/**
 * Panel de reservas. La perspectiva (reservas que el usuario hizo como
 * conductor vs las que le hicieron sobre sus vehículos como rentador) se
 * deriva del `activeRole` global: en modo rentador muestra `owner`, en modo
 * conductor muestra `conductor`. El cambio de rol vive en el switcher global.
 *
 * Optimización smart-cache: la primera request al endpoint trae todas las
 * reservas (sin filtro de estado). Si `total <= PAGE_SIZE` (caso común),
 * las demás tabs filtran client-side desde ese cache. Si tiene más, cada
 * tab dispara su propia request server-side.
 */
export function ReservasPage() {
  const { activeRole } = useAuth()
  const role: ReservationRole = activeRole === 'rentador' ? 'owner' : 'conductor'

  const [tab, setTab] = useState<TabKey>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const fromIso = from ? new Date(from).toISOString() : undefined
  const toIso = to ? new Date(to + 'T23:59:59').toISOString() : undefined

  const ACTIVE_STATUSES: ReservationStatus[] = [
    RESERVATION_STATUS.pending_approval,
    RESERVATION_STATUS.pending_payment,
    RESERVATION_STATUS.pending_balance,
    RESERVATION_STATUS.confirmed,
    RESERVATION_STATUS.in_progress,
  ]

  const probeQuery = useReservations({
    role,
    status: ACTIVE_STATUSES,
    from: fromIso,
    to: toIso,
    page: 1,
    pageSize: PAGE_SIZE,
  })

  /**
   * Conteo de solicitudes en estado `pending_approval` para el badge del header.
   * Para `role=owner` son solicitudes a aprobar; para `role=conductor` son las
   * que el usuario envió y esperan respuesta. Query dedicada con `pageSize=1`
   * (solo nos interesa `total`), cacheada por 30s.
   */
  const solicitudesCountQuery = useQuery({
    queryKey: ['reservationsCount', role, RESERVATION_STATUS.pending_approval],
    queryFn: () =>
      fetchReservations({
        role,
        status: [RESERVATION_STATUS.pending_approval],
        page: 1,
        pageSize: 1,
      }),
    select: (response) => response.total,
    staleTime: 30_000,
  })
  const solicitudesCount = solicitudesCountQuery.data ?? 0

  const allFitsInCache =
    !!(probeQuery.data && probeQuery.data.total <= PAGE_SIZE)
  const isProbeMatch = tab === 'all' && page === 1
  // El probe solo trae estados activos; el tab "Completadas" cae fuera de ese
  // set y siempre necesita su propia request server-side.
  const isProbeSubset = tab !== 'completed'
  const canFilterFromCache =
    tab !== 'all' && isProbeSubset && allFitsInCache && page === 1
  const needsTabQuery = !isProbeMatch && !canFilterFromCache

  const tabQuery = useReservations(
    {
      role,
      status: getTabStatuses(tab, role),
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
      const statuses = getTabStatuses(tab, role)
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
          <div className="flex items-center gap-2">
            {solicitudesCount > 0 && (
              <button
                type="button"
                onClick={() => onTabChange('solicitudes')}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm active:scale-[0.97]"
                aria-label={`${badgeLabel} (${solicitudesCount})`}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>{badgeLabel} ({solicitudesCount})</span>
              </button>
            )}
            <Link
              to="/notificaciones"
              aria-label={t('nav.notificaciones')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <Bell size={22} />
            </Link>
          </div>
        }
      />

      <div className="px-4 pt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {getTabs(role).map((definition) => (
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
              {definition.label}
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
        {data && data.items.length === 0 && <EmptyTab role={role} />}
        {data && (
          <CollapsedReservasList
            items={data.items}
            role={role}
            isRefetching={isRefetching}
          />
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

interface CollapsedReservasListProps {
  items: ReservationListItem[]
  role: ReservationRole
  isRefetching: boolean
}

/**
 * Una "extensión" es una row de `reservations` con `parentReservationId` apuntando
 * al alquiler original. Esta lista colapsa cada cadena (padre + extensiones del
 * mismo bloque) en una sola card representativa, eligiendo el eslabón "más
 * activo" según `pickRepresentative()` y usando como rango `min(startAt) →
 * max(endAt)` de los eslabones no cancelados/rechazados.
 *
 * Si el rentador del eslabón viene paginado en una página y el padre en otra,
 * cada uno se muestra como una card independiente — es solo una limitación
 * temporal del paginado server-side, no afecta correctness.
 */
function CollapsedReservasList({ items, role, isRefetching }: CollapsedReservasListProps) {
  const collapsed = useMemo(() => collapseChain(items), [items])
  return (
    <div
      className={
        isRefetching
          ? 'flex flex-col gap-3 opacity-50 pointer-events-none transition-opacity'
          : 'flex flex-col gap-3 transition-opacity'
      }
    >
      {collapsed.map((entry) => (
        <ReservaCard
          key={entry.representative.id}
          reserva={entry.representative}
          role={role}
          rangeStartAt={entry.rangeStartAt}
          rangeEndAt={entry.rangeEndAt}
          rangeTotalCents={entry.rangeTotalCents}
          hasPendingExtension={entry.hasPendingExtension}
        />
      ))}
    </div>
  )
}

interface ReservaCardProps {
  reserva: ReservationListItem
  role: ReservationRole
  rangeStartAt?: string
  rangeEndAt?: string
  rangeTotalCents?: number
  hasPendingExtension?: boolean
}

/**
 * Card de listado. La contraparte mostrada depende del rol: para conductor,
 * el rentador; para rentador, el conductor.
 *
 * Si el eslabón representativo está en `pending_approval` y el usuario está
 * con rol owner, la card muestra acciones rápidas inline para aprobar o
 * rechazar sin entrar al detalle. Cuando además es una extensión
 * (`parentReservationId` presente), suma un badge purple "Extensión" para
 * distinguirla visualmente de una solicitud de reserva nueva.
 */
function ReservaCard({ reserva, role, rangeStartAt, rangeEndAt, rangeTotalCents, hasPendingExtension }: ReservaCardProps) {
  const photo = reserva.vehicle.photo
  const counterpart = role === 'owner' ? reserva.conductor : reserva.rentador
  const startAt = rangeStartAt ?? reserva.startAt
  const endAt = rangeEndAt ?? reserva.endAt
  const totalCents = rangeTotalCents ?? reserva.totalCents

  const canHaveChat =
    reserva.status === RESERVATION_STATUS.confirmed ||
    reserva.status === RESERVATION_STATUS.in_progress
  const { data: unreadCount = 0 } = useUnreadCount(reserva.id, canHaveChat)

  const isPendingApprovalForOwner =
    role === 'owner' && reserva.status === RESERVATION_STATUS.pending_approval
  const isExtension = reserva.parentReservationId != null
  const showExtensionBadge = isPendingApprovalForOwner && isExtension
  const canReReservar =
    role === 'conductor' && reserva.status === RESERVATION_STATUS.completed

  return (
    <Link
      to="/reservas/$id"
      params={{ id: reserva.id }}
      search={role === 'owner' ? { role: 'owner' } : {}}
      className="card p-2 flex gap-3 active:opacity-80"
    >
      {/* Wrapper relativo para que el badge quede FUERA del overflow-hidden */}
      <div className="relative h-20 w-20 shrink-0">
        <div className="h-full w-full rounded overflow-hidden bg-surface-2 flex items-center justify-center">
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
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white ring-2 ring-white shadow-[0_0_10px_rgba(239,68,68,0.75)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-text-primary truncate">
            {reserva.vehicle.brand} {reserva.vehicle.model}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {showExtensionBadge && (
              <span className="inline-flex items-center rounded-full bg-purple-500/15 text-purple-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {t('reservas.list.extensionBadge')}
              </span>
            )}
            <ReservaStatusBadge estado={reserva.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <CalendarDays className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="truncate">
            <span className="font-semibold text-text-primary">
              {fmt.dayMonth(startAt)}
            </span>{' '}
            {fmt.time(startAt)}
            <ArrowRight className="inline h-3 w-3 mx-1 text-text-muted align-text-bottom" />
            <span className="font-semibold text-text-primary">
              {fmt.dayMonth(endAt)}
            </span>{' '}
            {fmt.time(endAt)}
          </span>
        </div>
        {hasPendingExtension && !showExtensionBadge && (
          <div className="flex items-center gap-1 text-[11px] text-warning">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{t('reservas.list.pendingExtension')}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span className="truncate">{counterpart.name}</span>
          </div>
          <span className="font-bold text-brand-400 shrink-0 text-sm">
            {fmt.currency(totalCents)}
          </span>
        </div>
        {isPendingApprovalForOwner && (
          <ReservationQuickActions
            reservationId={reserva.id}
            isExtension={isExtension}
          />
        )}
        {canReReservar && (
          <ReReservarButton
            reservationId={reserva.id}
            vehicleId={reserva.vehicle.id}
          />
        )}
      </div>
    </Link>
  )
}

interface ReReservarButtonProps {
  reservationId: string
  vehicleId: string
}

/**
 * Botón "Re-reservar" para una reserva completada. Detiene la propagación y
 * previene el default del `<Link>` contenedor para que clickearlo no dispare
 * la navegación al detalle de la reserva.
 */
function ReReservarButton({ reservationId, vehicleId }: ReReservarButtonProps) {
  const reReservar = useReReservar()
  return (
    <div className="pt-1">
      <Button
        variant="outline"
        className="w-full h-8 text-xs border-brand-500/40 text-brand-400 hover:bg-brand-500/10"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          void reReservar({ reservationId, vehicleId })
        }}
      >
        {t('reservar.reReservar.boton')}
      </Button>
    </div>
  )
}

interface ReservationQuickActionsProps {
  reservationId: string
  isExtension: boolean
}

/**
 * Acciones rápidas para que el rentador apruebe o rechace una solicitud
 * `pending_approval` desde la lista, sin tener que entrar al detalle. Cubre
 * tanto solicitudes de reserva nuevas como solicitudes de extensión —
 * `isExtension` selecciona los copies (modal + toast) adecuados.
 *
 * Los botones detienen propagación y previenen el default del `<Link>`
 * contenedor para que clickearlos no dispare la navegación al detalle.
 */
function ReservationQuickActions({ reservationId, isExtension }: ReservationQuickActionsProps) {
  const approveMutation = useApproveReservation()
  const rejectMutation = useRejectReservation()
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const isBusy = approveMutation.isPending || rejectMutation.isPending

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(reservationId)
      toast.success(
        t(
          isExtension
            ? 'rentador.reservas.extension.aprobada'
            : 'rentador.reservas.aprobada',
        ),
      )
      setShowApprove(false)
    } catch {
      toast.error(t('rentador.reservas.errorAccion'))
    }
  }

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({
        reservationId,
        reason: reason.trim().length > 0 ? reason.trim() : undefined,
      })
      toast.success(
        t(
          isExtension
            ? 'rentador.reservas.extension.rechazada'
            : 'rentador.reservas.rechazada',
        ),
      )
      setShowReject(false)
    } catch {
      toast.error(t('rentador.reservas.errorAccion'))
    }
  }

  const stop = (handler: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handler()
  }

  return (
    <>
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 h-8 text-xs border-danger/40 text-danger-400 hover:bg-danger/10"
          disabled={isBusy}
          onClick={stop(() => setShowReject(true))}
        >
          <X className="h-3.5 w-3.5" />
          {t('rentador.reservas.detalle.rechazar')}
        </Button>
        <Button
          className="flex-1 h-8 text-xs"
          disabled={isBusy}
          onClick={stop(() => setShowApprove(true))}
        >
          <Check className="h-3.5 w-3.5" />
          {t('rentador.reservas.detalle.aprobar')}
        </Button>
      </div>
      {showApprove && (
        <ConfirmationModal
          title={t(
            isExtension
              ? 'reservas.approve.extensionTitle'
              : 'rentador.reservas.aprobar.confirmTitle',
          )}
          body={t(
            isExtension
              ? 'reservas.approve.extensionBody'
              : 'rentador.reservas.aprobar.confirmBody',
          )}
          confirmLabel={t('rentador.reservas.aprobar.confirmar')}
          submittingLabel={t('rentador.reservas.detalle.aprobando')}
          submitting={approveMutation.isPending}
          onConfirm={handleApprove}
          onCancel={() => setShowApprove(false)}
        />
      )}
      {showReject && (
        <RejectReasonModal
          submitting={rejectMutation.isPending}
          onSubmit={handleReject}
          onCancel={() => setShowReject(false)}
        />
      )}
    </>
  )
}

function ReservasListSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-2 flex gap-3">
          {/* Miniatura vehículo */}
          <Skeleton className="h-20 w-20 shrink-0 rounded" />
          <div className="flex-1 flex flex-col gap-2 min-w-0 py-0.5">
            {/* Título + badge */}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
            {/* Fechas */}
            <Skeleton className="h-3 w-4/5" />
            {/* Contraparte + monto */}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * Empty state del listado. Para el lado conductor invita a buscar vehículos;
 * para el lado rentador refina la copy según si el usuario tiene flota:
 * si tiene 0 vehículos publicados, propone publicar el primero (onboarding).
 * Si tiene flota pero esta categoría está vacía, muestra el copy neutro.
 *
 * Hace su propia query de `getMyVehicles` (compartida con MisVehiculosPage
 * vía queryKey) solo cuando se renderiza — no bloquea ni el toggle ni el
 * listado principal.
 */
function EmptyTab({ role }: { role: ReservationRole }) {
  if (role === 'conductor') {
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
  return <OwnerEmptyTab />
}

function OwnerEmptyTab() {
  const myVehiclesQuery = useQuery({
    queryKey: ['vehicles', 'mine'],
    queryFn: () => vehiclesApi.getMyVehicles(),
  })
  const sinVehiculos =
    myVehiclesQuery.isFetched && (myVehiclesQuery.data?.length ?? 0) === 0
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
