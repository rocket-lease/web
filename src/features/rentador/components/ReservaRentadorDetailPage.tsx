import { useParams } from '@tanstack/react-router'
import { CalendarDays, User } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { Separator } from '@/ui/separator'
import { Skeleton } from '@/ui/skeleton'
import { Avatar } from '@/ui/avatar'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useOwnerReservations } from '../hooks/useOwnerReservations'

const LARGE_PAGE = 100

export function ReservaRentadorDetailPage() {
  const { id = '' } = useParams({ strict: false })
  // El detalle reusa el listado en cache (tanstack-query lo comparte por queryKey).
  // Si el usuario entra por deep-link, refetch del listado y buscamos por id.
  const { data, isLoading, error } = useOwnerReservations({
    page: 1,
    pageSize: LARGE_PAGE,
  })

  const reserva = data?.items.find((r) => r.id === id)

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('rentador.reservas.detalle.title')} showBack />
        <div className="px-4 py-5 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !reserva) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('rentador.reservas.detalle.title')} showBack />
        <p className="px-6 py-12 text-center text-text-secondary">
          {t('rentador.reservas.detalle.noEncontrada')}
        </p>
      </div>
    )
  }

  const photo = reserva.vehicle.photo

  return (
    <div className="flex flex-col">
      <PageHeader title={t('rentador.reservas.detalle.title')} showBack />

      <div className="px-4 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Reserva #{reserva.id.slice(0, 8)}
          </p>
          <ReservaStatusBadge estado={reserva.status} />
        </div>

        <div className="card overflow-hidden">
          {photo && (
            <div className="aspect-video bg-surface-2">
              <img
                src={photo}
                alt={reserva.vehicle.brand}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <p className="font-bold text-text-primary">
              {reserva.vehicle.brand} {reserva.vehicle.model}{' '}
              {reserva.vehicle.year}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {t('rentador.reservas.detalle.fechas')}
          </p>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-surface-2 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-brand-400" />
                <span className="text-xs text-text-muted">
                  {t('rentador.reservas.detalle.desde')}
                </span>
              </div>
              <p className="font-semibold text-text-primary">
                {fmt.dateShort(reserva.startAt)}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-surface-2 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-brand-400" />
                <span className="text-xs text-text-muted">
                  {t('rentador.reservas.detalle.hasta')}
                </span>
              </div>
              <p className="font-semibold text-text-primary">
                {fmt.dateShort(reserva.endAt)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          {reserva.conductor.avatarUrl ? (
            <Avatar
              src={reserva.conductor.avatarUrl}
              alt={reserva.conductor.name}
              className="h-10 w-10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center">
              <User className="h-5 w-5 text-text-muted" />
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted">
              {t('rentador.reservas.detalle.conductor')}
            </p>
            <p className="font-semibold text-text-primary">
              {reserva.conductor.name}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="font-semibold text-text-primary">
            {t('rentador.reservas.detalle.total')}
          </p>
          <p className="text-xl font-bold text-brand-400">
            {fmt.currency(reserva.totalCents)}
          </p>
        </div>
      </div>
    </div>
  )
}
