import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'

/**
 * Query que devuelve la cantidad de reservas activas por vehículo.
 * El queryKey se ordena para evitar cache-miss por diferente orden de ids.
 */
export function useActiveReservationsCount(vehicleIds: string[], enabled: boolean) {
  return useQuery({
    queryKey: ['vehicles', 'active-reservations-count', [...vehicleIds].sort()],
    queryFn: () => vehiclesApi.getActiveReservationsCount({ vehicleIds }),
    enabled: enabled && vehicleIds.length > 0,
  })
}
