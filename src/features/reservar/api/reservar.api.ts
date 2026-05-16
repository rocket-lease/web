import { apiClient } from '@/lib/api-client'
import {
  CancelReservationResponseSchema,
  CreateReservationResponseSchema,
  ConfirmReservationPaymentResponseSchema,
  GetReservationResponseSchema,
  ReservationsListResponseSchema,
  VehicleBusyRangesResponseSchema,
  type CancelReservationResponse,
  type CreateReservationRequest,
  type CreateReservationResponse,
  type ConfirmReservationPaymentRequest,
  type ConfirmReservationPaymentResponse,
  type GetReservationResponse,
  type ReservationsListResponse,
  type VehicleBusyRangesResponse,
} from '@rocket-lease/contracts'

export const reservarApi = {
  async create(data: CreateReservationRequest): Promise<CreateReservationResponse> {
    const res = await apiClient.post<unknown>('/reservations', data)
    return CreateReservationResponseSchema.parse(res)
  },

  async confirmPayment(
    reservationId: string,
    data: ConfirmReservationPaymentRequest,
  ): Promise<ConfirmReservationPaymentResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/payment`,
      data,
    )
    return ConfirmReservationPaymentResponseSchema.parse(res)
  },

  async getById(reservationId: string): Promise<GetReservationResponse> {
    const res = await apiClient.get<unknown>(`/reservations/${reservationId}`)
    return GetReservationResponseSchema.parse(res)
  },

  async listMine(): Promise<ReservationsListResponse> {
    const res = await apiClient.get<unknown>(
      '/reservations?role=conductor&pageSize=100',
    )
    return ReservationsListResponseSchema.parse(res)
  },

  async getBusyRanges(vehicleId: string): Promise<VehicleBusyRangesResponse> {
    const res = await apiClient.get<unknown>(
      `/reservations/vehicle/${vehicleId}/busy-ranges`,
    )
    return VehicleBusyRangesResponseSchema.parse(res)
  },

  async cancel(reservationId: string): Promise<CancelReservationResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/cancel`,
      {},
    )
    return CancelReservationResponseSchema.parse(res)
  },
}
