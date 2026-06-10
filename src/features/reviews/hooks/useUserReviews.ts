import { useQuery } from '@tanstack/react-query'
import { fetchUserReviews } from '../api/reviews.api'

export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => fetchUserReviews(userId),
    staleTime: 30_000,
  })
}
