import { apiClient } from '@/lib/api-client'
import { apiEndpoints } from '@rocket-lease/contracts'
import {
  CreateReviewRequestSchema,
  CreateReviewResponseSchema,
  type CreateReviewRequest,
  type CreateReviewResponse,
  RentadorReviewsResponseSchema,
  type RentadorReviewsResponse,
} from '@rocket-lease/contracts'

export async function fetchRentadorReviews(): Promise<RentadorReviewsResponse> {
  const res = await apiClient.get<unknown>(apiEndpoints.reviews.mine)
  return RentadorReviewsResponseSchema.parse(res)
}

export async function fetchConductorReviews(): Promise<RentadorReviewsResponse> {
  const res = await apiClient.get<unknown>(apiEndpoints.reviews.conductorMine)
  return RentadorReviewsResponseSchema.parse(res)
}

export async function fetchVehicleReviews(
  vehicleId: string,
): Promise<RentadorReviewsResponse> {
  const res = await apiClient.get<unknown>(apiEndpoints.reviews.vehicle(vehicleId))
  return RentadorReviewsResponseSchema.parse(res)
}

export async function fetchUserReviews(
  userId: string,
): Promise<RentadorReviewsResponse> {
  const res = await apiClient.get<unknown>(apiEndpoints.reviews.user(userId))
  return RentadorReviewsResponseSchema.parse(res)
}

export async function createReview(
  reservationId: string,
  data: CreateReviewRequest,
): Promise<CreateReviewResponse> {
  const parsed = CreateReviewRequestSchema.parse(data)
  const res = await apiClient.post<unknown>(
    apiEndpoints.reviews.create(reservationId),
    parsed,
  )
  return CreateReviewResponseSchema.parse(res)
}
