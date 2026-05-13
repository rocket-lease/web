import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '../api/vehiculos.api'

export function useAllVehiculos() {
  return useQuery({
    queryKey: ['vehiculos', 'all'],
    queryFn:  () => vehiclesApi.getAll(),
    staleTime: 1000 * 60 * 5,
  })
}
