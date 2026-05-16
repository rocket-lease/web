import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarDays, ClipboardList } from 'lucide-react'
import type {
  OwnerReservation,
  ReservationStatus,
} from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
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

export function PanelReservasRentadorPage() {
  const [tab, setTab] = useState<TabKey>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useOwnerReservations({
    status: TAB_TO_STATUSES[tab],
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

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

      <div className="px-4 pb-6 flex flex-col gap-3">
        {isLoading && <ReservasListSkeleton />}
        {error && (
          <p className="text-sm text-danger-400 py-6 text-center">
            {t('rentador.reservas.error')}
          </p>
        )}
        {data && data.items.length === 0 && <EmptyTab />}
        {data &&
          data.items.map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} />
          ))}
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

function ReservaCard({ reserva }: { reserva: OwnerReservation }) {
  return (
    <Link
      to="/rentador/reservas/$id"
      params={{ id: reserva.id }}
      className="card p-4 flex flex-col gap-3 active:opacity-80"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-text-primary">
          {reserva.vehicle.brand} {reserva.vehicle.model}
        </p>
        <ReservaStatusBadge estado={reserva.status} />
      </div>
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <CalendarDays className="h-4 w-4 text-text-muted" />
        <span>
          {fmt.dateShort(reserva.startAt)} → {fmt.dateShort(reserva.endAt)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{reserva.conductor.name}</span>
        <span className="font-bold text-brand-400">
          {fmt.currency(reserva.totalCents)}
        </span>
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

function EmptyTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <ClipboardList className="h-12 w-12 text-text-muted" />
      <p className="text-text-secondary">{t('rentador.reservas.empty.sinReservas')}</p>
    </div>
  )
}
