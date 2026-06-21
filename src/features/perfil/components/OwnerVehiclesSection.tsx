import { useQuery } from '@tanstack/react-query'
import { VehiculoCard } from '@/features/vehiculos/components/VehiculoCard'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { t } from '@/i18n/es'

interface Props {
  ownerId: string
}

/**
 * Galería de vehículos publicados por un usuario, en su perfil público. La sección
 * solo se renderiza si tiene vehículos: si está vacía (o todavía cargando/falló),
 * no se muestra nada para no ensuciar el perfil.
 */
export function OwnerVehiclesSection({ ownerId }: Props) {
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', 'by-owner', ownerId],
    queryFn: () => vehiclesApi.getByOwnerId(ownerId),
    enabled: Boolean(ownerId),
  })

  if (!vehicles || vehicles.length === 0) return null

  return (
    <section className="mt-6">
      <div className="px-4 mb-3 flex items-baseline justify-between">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.publishedVehicles')}
        </p>
        <span className="text-xs text-text-muted">{vehicles.length}</span>
      </div>

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
    </section>
  )
}
