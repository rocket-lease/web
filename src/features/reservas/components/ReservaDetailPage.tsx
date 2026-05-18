import { useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Skeleton } from '@/ui/skeleton'
import { t } from '@/i18n/es'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { ConductorView } from './detail/ConductorView'
import { RentadorView } from './detail/RentadorView'

/**
 * Dispatcher del detalle de una reserva. Fetchea la reserva por id y delega
 * en `ConductorView` o `RentadorView` según la perspectiva.
 *
 * La perspectiva se determina así, en orden de prioridad:
 *   1. `?role=` en la URL (search param) — lo setea el listado al navegar.
 *   2. Ownership: si `user.id === reservation.rentadorId` → rentador; sino
 *      conductor. Fallback para deep-link sin search param.
 *
 * El endpoint `GET /reservations/:id` autoriza tanto al conductor como al
 * rentador de la reserva — el filtro de perspectiva es solo de UI.
 */
export function ReservaDetailPage() {
  const { id = '' } = useParams({ strict: false })
  const { role: roleSearch } = useSearch({ strict: false }) as { role?: 'conductor' | 'owner' }
  const { user } = useAuth()

  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="px-4 py-5 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !reservation) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-sm text-danger">
            {t('reservar.errors.RESERVATION_NOT_FOUND')}
          </p>
        </div>
      </div>
    )
  }

  const perspective: 'conductor' | 'owner' =
    roleSearch === 'owner' || roleSearch === 'conductor'
      ? roleSearch
      : user?.id === reservation.rentadorId
        ? 'owner'
        : 'conductor'

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.detail.title')} showBack />
      {perspective === 'owner' ? (
        <RentadorView reservation={reservation} />
      ) : (
        <ConductorView reservation={reservation} />
      )}
    </div>
  )
}
