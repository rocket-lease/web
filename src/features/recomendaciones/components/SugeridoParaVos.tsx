import { Sparkle } from '@phosphor-icons/react'
import { VehiculoCard, VehiculoCardSkeleton } from '@/features/vehiculos/components/VehiculoCard'
import { t } from '@/i18n/es'
import type { RecommendedVehicle, GetVehicleResponse } from '@rocket-lease/contracts'
import { useRecommendations } from '../hooks/useRecommendations'

interface SugeridoParaVosProps {
  levelDiscountPercentage?: number
}

/**
 * Convierte un RecommendedVehicle al shape que espera VehiculoCard.
 * Los campos que tienen fallback en VehiculoCard (demandMultiplier ?? 1,
 * autoAccept como falsy, isPromoted como falsy) se mantienen con valores
 * por defecto seguros.
 */
function toVehicleCard(v: RecommendedVehicle): GetVehicleResponse {
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    transmission: v.transmission as GetVehicleResponse['transmission'],
    passengers: v.passengers,
    isAccessible: v.isAccessible,
    basePriceCents: v.basePriceCents,
    characteristics: v.characteristics as GetVehicleResponse['characteristics'],
    enabled: v.enabled,
    photos: v.photos,
    mileage: v.mileage,
    color: v.color,
    trunkLiters: v.trunkLiters,
    isPromoted: v.isPromoted,
    autoAccept: v.autoAccept,
    demandMultiplier: v.demandMultiplier,
    // Campos que el recommendation endpoint no devuelve — usamos defaults seguros
    ownerId: '',
    plate: '',
    description: null,
    availableFrom: '',
    province: v.province,
    city: v.city,
    address: null,
    latitude: null,
    longitude: null,
    locationApproximate: false,
    homeDeliveryEnabled: false,
    homeDeliveryFeeCents: null,
    homeReturnEnabled: false,
    homeReturnFeeCents: null,
    dynamicPricingEnabled: false,
    discountTiers: [],
  } satisfies GetVehicleResponse
}

/**
 * Sección "Sugerido para vos" que aparece en la home del conductor.
 * Solo se muestra cuando hay recomendaciones (el conductor tiene historial).
 */
export function SugeridoParaVos({ levelDiscountPercentage }: SugeridoParaVosProps) {
  const { data, isLoading, isError } = useRecommendations()

  if (isError) return null

  // Estado de carga
  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <header className="px-5 flex items-center gap-2">
          <Sparkle size={16} weight="fill" className="text-warning" />
          <h2 className="text-base font-bold text-text-primary">{t('recomendaciones.title')}</h2>
        </header>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 px-5 pb-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 w-64">
                <VehiculoCardSkeleton />
              </div>
            ))}
            <div aria-hidden className="shrink-0 w-1" />
          </div>
        </div>
      </section>
    )
  }

  // No hay sección (conductor sin historial)
  if (!data?.section || data.vehicles.length === 0) return null

  const vehicles = data.vehicles.map(toVehicleCard)

  return (
    <section className="flex flex-col gap-3">
      <header className="px-5 flex items-center gap-2">
        <Sparkle size={16} weight="fill" className="text-warning" />
        <h2 className="text-base font-bold text-text-primary">{data.section}</h2>
      </header>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-5 pb-1">
          {vehicles.map((v) => (
            <div key={v.id} className="shrink-0 w-64">
              <VehiculoCard
                vehiculo={v}
                levelDiscountPercentage={levelDiscountPercentage}
              />
            </div>
          ))}
          <div aria-hidden className="shrink-0 w-1" />
        </div>
      </div>
    </section>
  )
}
