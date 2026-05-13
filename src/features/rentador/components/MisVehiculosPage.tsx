import { Plus, Car } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'

const myVehiclesQueryKey = ['vehicles', 'mine'] as const

export function MisVehiculosPage() {
  const vehiclesQuery = useQuery({
    queryKey: myVehiclesQueryKey,
    queryFn: () => vehiclesApi.getMyVehicles(),
  })

  const vehicles = vehiclesQuery.data ?? []

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

      {vehiclesQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <p className="text-text-secondary">{t('general.loading')}</p>
        </div>
      ) : vehiclesQuery.isError ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <p className="text-text-secondary">{t('error.default')}</p>
          <Button variant="secondary" onClick={() => vehiclesQuery.refetch()}>
            {t('general.retry')}
          </Button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <Car className="h-14 w-14 text-text-muted" />
          <p className="text-text-secondary">{t('misVehiculos.empty')}</p>
          <Link to="/mis-vehiculos/nuevo">
            <Button>{t('misVehiculos.emptyAction')}</Button>
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {vehicles.map(v => (
            <article key={v.id} className="card flex gap-4 p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <img src={v.photos[0]} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-text-primary">
                    {v.brand} {v.model} {v.year}
                  </p>
                  <Badge variant={v.enabled ? 'success' : 'secondary'}>
                    {v.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-brand-400">
                  {fmt.currency(v.basePrice *100)} / día 
                </p>
                {v.city || v.province ? (
                  <p className="mt-1 text-xs text-info">
                    {v.city}
                    {v.city && v.province ? ' · ' : ''}
                    {v.province}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
