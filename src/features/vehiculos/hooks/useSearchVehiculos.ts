import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '../api/vehiculos.api'

export function useSearchVehiculos(params: { city: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['vehiculos', 'search', params],
    queryFn:  () => vehiclesApi.getAll({ city: params.city, from: params.startDate, to: params.endDate }),
    staleTime: 1000 * 60 * 2,
  })
}
