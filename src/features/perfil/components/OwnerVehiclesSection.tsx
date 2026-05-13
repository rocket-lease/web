import { useQuery } from '@tanstack/react-query'
import { Car } from 'lucide-react'
import { VehiculoCard } from '@/features/vehiculos/components/VehiculoCard'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { t } from '@/i18n/es'

interface Props {
  ownerId: string
}

export function OwnerVehiclesSection({ ownerId }: Props) {
  const { data: vehicles, isLoading, isError } = useQuery({
    queryKey: ['vehicles', 'by-owner', ownerId],
    queryFn: () => vehiclesApi.getByOwnerId(ownerId),
    enabled: Boolean(ownerId),
  })

  return (
    <div className="px-4 mt-6">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        {t('perfil.publishedVehicles')}
      </p>

      {isLoading && (
        <div className="rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center text-sm text-text-muted">
          {t('general.loading')}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center text-sm text-danger">
          {t('buscar.error')}
        </div>
      )}

      {!isLoading && !isError && vehicles && vehicles.length === 0 && (
        <div className="rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
            <Car className="h-5 w-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">{t('perfil.publishedVehiclesEmpty')}</p>
        </div>
      )}

      {!isLoading && !isError && vehicles && vehicles.length > 0 && (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehiculoCard key={v.id} vehiculo={v} />
          ))}
        </div>
      )}
    </div>
  )
}
