import { Plus, Car } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

const mockVehiculos = [
  {
    id: '1',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2022,
    tarifa: { daily: 850000 },
    estado: 'active' as const,
    fotoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    reservasActivas: 1,
  },
  {
    id: '2',
    marca: 'Volkswagen',
    modelo: 'Polo',
    anio: 2021,
    tarifa: { daily: 620000 },
    estado: 'active' as const,
    fotoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200',
    reservasActivas: 0,
  },
]

export function MisVehiculosPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('misVehiculos.title')}
        actions={
          <Link to="/mis-vehiculos/nuevo">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Publicar
            </Button>
          </Link>
        }
      />

      {mockVehiculos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <Car className="h-14 w-14 text-text-muted" />
          <p className="text-text-secondary">{t('misVehiculos.empty')}</p>
          <Link to="/mis-vehiculos/nuevo">
            <Button>{t('misVehiculos.emptyAction')}</Button>
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {mockVehiculos.map(v => (
            <article key={v.id} className="card flex gap-4 p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <img src={v.fotoUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-text-primary">
                    {v.marca} {v.modelo} {v.anio}
                  </p>
                  <Badge variant={v.estado === 'active' ? 'success' : 'secondary'}>
                    {v.estado === 'active' ? t('misVehiculos.active') : t('misVehiculos.inactive')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-brand-400">
                  {fmt.currency(v.tarifa.daily)} / día
                </p>
                {v.reservasActivas > 0 && (
                  <p className="mt-1 text-xs text-info">
                    {v.reservasActivas} reserva activa
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
