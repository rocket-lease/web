import { apiClient } from '@/lib/api-client'
import {
  RentadorReviewsResponseSchema,
  type RentadorReviewsResponse,
} from '@rocket-lease/contracts'

export async function fetchRentadorReviews(): Promise<RentadorReviewsResponse> {
  const res = await apiClient.get<unknown>('/reviews/rentador/mine')
  return RentadorReviewsResponseSchema.parse(res)
}
