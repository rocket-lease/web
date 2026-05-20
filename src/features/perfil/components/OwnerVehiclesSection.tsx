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
    <section className="mt-6">
      <div className="px-4 mb-3 flex items-baseline justify-between">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.publishedVehicles')}
        </p>
        {vehicles && vehicles.length > 0 && (
          <span className="text-xs text-text-muted">{vehicles.length}</span>
        )}
      </div>

      {isLoading && (
        <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center text-sm text-text-muted">
          {t('general.loading')}
        </div>
      )}

      {isError && (
        <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center text-sm text-danger">
          {t('buscar.error')}
        </div>
      )}

      {!isLoading && !isError && vehicles && vehicles.length === 0 && (
        <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
            <Car className="h-5 w-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">{t('perfil.publishedVehiclesEmpty')}</p>
        </div>
      )}

      {!isLoading && !isError && vehicles && vehicles.length > 0 && (
        <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4">
          <div className="flex gap-3 px-4 pb-1">
            {vehicles.map((v) => (
              <VehiculoCard
                key={v.id}
                vehiculo={v}
                className="snap-start shrink-0 w-[80vw] max-w-[320px]"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
