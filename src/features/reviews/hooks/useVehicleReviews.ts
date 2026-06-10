import { useQuery } from '@tanstack/react-query'
import { fetchVehicleReviews } from '../api/reviews.api'

export function useVehicleReviews(vehicleId: string) {
  return useQuery({
    queryKey: ['reviews', 'vehicle', vehicleId],
    queryFn: () => fetchVehicleReviews(vehicleId),
    staleTime: 30_000,
  })
}
