import { useQuery } from '@tanstack/react-query'
import { fetchConductorReviews } from '../api/reviews.api'

export function useConductorReviews() {
  return useQuery({
    queryKey: ['reviews', 'conductor', 'mine'],
    queryFn: fetchConductorReviews,
    staleTime: 30_000,
  })
}
