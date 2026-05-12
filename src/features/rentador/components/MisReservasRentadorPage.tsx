import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { ReservaEstado } from '@/features/reservas/types'

const mockReservas = [
  {
    id: 'res1',
    conductor: 'Julián Torres',
    vehiculo: 'Toyota Corolla',
    estado: 'confirmed' as ReservaEstado,
    fechaDesde: '2026-05-15T10:00:00Z',
    fechaHasta: '2026-05-18T10:00:00Z',
    totalCents: 255000000,
    avatarUrl: null as string | null,
  },
  {
    id: 'res2',
    conductor: 'Sofía García',
    vehiculo: 'VW Polo',
    estado: 'in_progress' as ReservaEstado,
    fechaDesde: '2026-05-10T09:00:00Z',
    fechaHasta: '2026-05-12T09:00:00Z',
    totalCents: 124000000,
    avatarUrl: null as string | null,
  },
  {
    id: 'res3',
    conductor: 'Tomás Herrera',
    vehiculo: 'Ford EcoSport',
    estado: 'pending_payment' as ReservaEstado,
    fechaDesde: '2026-05-20T08:00:00Z',
    fechaHasta: '2026-05-22T08:00:00Z',
    totalCents: 220000000,
    avatarUrl: null as string | null,
  },
]

export function MisReservasRentadorPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title={t('nav.misReservas')} />

      <div className="px-4 py-4 space-y-3">
        {mockReservas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <ClipboardList className="h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No hay reservas todavía</p>
          </div>
        ) : (
          mockReservas.map(r => (
            <article key={r.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{r.conductor}</p>
                  <p className="text-sm text-text-muted">{r.vehiculo}</p>
                </div>
                <ReservaStatusBadge estado={r.estado} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  {fmt.dateShort(r.fechaDesde)} → {fmt.dateShort(r.fechaHasta)}
                </span>
                <span className="font-semibold text-brand-400">{fmt.currency(r.totalCents)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
