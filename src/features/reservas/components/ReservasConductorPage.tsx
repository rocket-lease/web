import { CalendarCheck, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { Reserva } from '../types'

const MOCK_RESERVAS: Reserva[] = [
  {
    id: 'res1',
    conductorId: 'c1',
    vehiculoId: '1',
    rentadorId: 'r1',
    estado: 'confirmed',
    fechaDesde: '2026-05-15T10:00:00Z',
    fechaHasta: '2026-05-18T10:00:00Z',
    totalCents: 255000000,
    vehiculo: { marca: 'Toyota', modelo: 'Corolla', anio: 2022, fotoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200' },
    rentador: { nombre: 'Lucas M.' },
    createdAt: '2026-05-10T12:00:00Z',
    updatedAt: '2026-05-10T12:05:00Z',
  },
  {
    id: 'res2',
    conductorId: 'c1',
    vehiculoId: '2',
    rentadorId: 'r2',
    estado: 'completed',
    fechaDesde: '2026-04-01T09:00:00Z',
    fechaHasta: '2026-04-03T09:00:00Z',
    totalCents: 124000000,
    vehiculo: { marca: 'Volkswagen', modelo: 'Polo', anio: 2021, fotoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200' },
    rentador: { nombre: 'Carmen V.' },
    createdAt: '2026-03-28T15:00:00Z',
    updatedAt: '2026-04-03T10:30:00Z',
  },
]

export function ReservasConductorPage() {
  if (MOCK_RESERVAS.length === 0) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.title')} />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <CalendarCheck className="h-14 w-14 text-text-muted" />
          <p className="text-text-secondary">{t('reservas.empty')}</p>
          <Link to="/buscar">
            <Button variant="secondary">{t('reservas.emptyAction')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.title')} />

      <div className="px-4 py-4 space-y-3">
        {MOCK_RESERVAS.map(reserva => (
          <Link key={reserva.id} to="/reservas/$id" params={{ id: reserva.id }}>
            <article className="card p-4 flex gap-4 active:scale-[0.98] transition-transform">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {reserva.vehiculo.fotoUrl && (
                  <img src={reserva.vehiculo.fotoUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-text-primary truncate">
                    {reserva.vehiculo.marca} {reserva.vehiculo.modelo}
                  </p>
                  <ReservaStatusBadge estado={reserva.estado} />
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {fmt.dateShort(reserva.fechaDesde)} → {fmt.dateShort(reserva.fechaHasta)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-brand-400">
                  {fmt.currency(reserva.totalCents)}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}

export { Plus }
