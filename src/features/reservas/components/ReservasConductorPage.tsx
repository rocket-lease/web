import { CalendarCheck, Car } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { useMyReservations } from '../hooks/useMyReservations'

export function ReservasConductorPage() {
  const { data, isLoading } = useMyReservations()
  const items = data?.items ?? []

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.title')} />

      {isLoading && (
        <div className="px-4 py-6 space-y-4">
          <div className="h-44 rounded-2xl bg-surface-2 animate-pulse" />
          <div className="h-44 rounded-2xl bg-surface-2 animate-pulse" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <CalendarCheck className="h-14 w-14 text-text-muted" />
          <p className="text-text-secondary">{t('reservas.empty')}</p>
          <Link to="/buscar">
            <Button variant="secondary">{t('reservas.emptyAction')}</Button>
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <ul className="px-4 py-4 space-y-4">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                to="/reservas/$id"
                params={{ id: r.id }}
                className="block overflow-hidden rounded-2xl border border-white/8 bg-surface-1 transition-colors hover:bg-surface-2 active:scale-[0.99]"
              >
                <div className="h-32 bg-surface-2 relative">
                  {r.vehicle.photo ? (
                    <img
                      src={r.vehicle.photo}
                      alt={`${r.vehicle.brand} ${r.vehicle.model}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-text-muted" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <ReservaStatusBadge estado={r.status} />
                  </div>
                </div>
                <div className="px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">Reserva #{r.id.slice(0, 8)}</p>
                      <p className="text-base font-bold text-text-primary truncate">
                        {r.vehicle.brand} {r.vehicle.model} {r.vehicle.year}
                      </p>
                    </div>
                    <p className="text-base font-bold text-brand-400 shrink-0">
                      {fmt.price(r.totalCents)}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">
                    {fmt.dateTime(r.startAt)} → {fmt.dateTime(r.endAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
