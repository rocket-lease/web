import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { VehicleLocationMap } from '@/features/mapa/components/VehicleLocationMap'
import { Separator } from '@/ui/separator'
import { t } from '@/i18n/es'

/**
 * Sección de ubicación del vehículo dentro del detalle de una reserva.
 * El summary embebido en la reserva no trae coordenadas, así que se busca
 * el vehículo completo. Si no se puede resolver, no renderiza nada.
 */
export function ReservaUbicacion({ vehicleId }: { vehicleId: string }) {
  const { data: vehicle } = useQuery({
    queryKey: ['vehiculos', 'detail', vehicleId],
    queryFn: () => vehiclesApi.getById(vehicleId),
    staleTime: 1000 * 60 * 5,
  })

  if (!vehicle) return null

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {t('vehiculo.location')}
        </p>
        <VehicleLocationMap
          latitude={vehicle.latitude}
          longitude={vehicle.longitude}
          address={vehicle.address}
          city={vehicle.city}
          province={vehicle.province}
        />
      </div>
    </>
  )
}
