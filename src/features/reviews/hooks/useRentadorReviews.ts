import { useQuery } from '@tanstack/react-query'
import { fetchRentadorReviews } from '../api/reviews.api'

export function useRentadorReviews() {
  return useQuery({
    queryKey: ['reviews', 'rentador', 'mine'],
    queryFn: fetchRentadorReviews,
    staleTime: 30_000,
  })
}
