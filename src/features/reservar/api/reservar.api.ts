import { apiClient } from '@/lib/api-client'
import {
  CancelReservationResponseSchema,
  CreateReservationResponseSchema,
  ConfirmReservationPaymentResponseSchema,
  ConfirmTransferResponseSchema,
  ConfirmReservationBalanceResponseSchema,
  InitiateBalanceTransferResponseSchema,
  ConfirmBalanceTransferResponseSchema,
  GetReservationResponseSchema,
  InitiateTransferResponseSchema,
  VehicleBusyRangesResponseSchema,
  type CancelReservationResponse,
  type CreateReservationRequest,
  type CreateReservationResponse,
  type ConfirmReservationPaymentRequest,
  type ConfirmReservationPaymentResponse,
  type ConfirmTransferResponse,
  type ConfirmReservationBalanceRequest,
  type ConfirmReservationBalanceResponse,
  type InitiateBalanceTransferResponse,
  type ConfirmBalanceTransferResponse,
  type InitiateTransferRequest,
  type GetReservationResponse,
  type InitiateTransferResponse,
  type VehicleBusyRangesResponse,
  type Voucher,
  type VerifyVoucherResponse,
  VoucherSchema,
  VerifyVoucherResponseSchema,
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

  async initiateTransfer(
    reservationId: string,
    data: InitiateTransferRequest = {},
  ): Promise<InitiateTransferResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/transfer`,
      data,
    )
    return InitiateTransferResponseSchema.parse(res)
  },

  async confirmTransfer(
    reservationId: string,
  ): Promise<ConfirmTransferResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/transfer/confirm`,
      {},
    )
    return ConfirmTransferResponseSchema.parse(res)
  },

  // US-30: pago del saldo de una reserva señada.
  async payBalance(
    reservationId: string,
    data: ConfirmReservationBalanceRequest,
  ): Promise<ConfirmReservationBalanceResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/balance`,
      data,
    )
    return ConfirmReservationBalanceResponseSchema.parse(res)
  },

  async initiateBalanceTransfer(
    reservationId: string,
  ): Promise<InitiateBalanceTransferResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/balance/transfer`,
      {},
    )
    return InitiateBalanceTransferResponseSchema.parse(res)
  },

  async confirmBalanceTransfer(
    reservationId: string,
  ): Promise<ConfirmBalanceTransferResponse> {
    const res = await apiClient.post<unknown>(
      `/reservations/${reservationId}/balance/transfer/confirm`,
      {},
    )
    return ConfirmBalanceTransferResponseSchema.parse(res)
  },

  async getById(reservationId: string): Promise<GetReservationResponse> {
    const res = await apiClient.get<unknown>(`/reservations/${reservationId}`)
    return GetReservationResponseSchema.parse(res)
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

  async getVoucher(reservationId: string): Promise<Voucher> {
    const res = await apiClient.get<unknown>(`/reservations/${reservationId}/voucher`)
    return VoucherSchema.parse(res)
  },

  async verifyVoucher(token: string): Promise<VerifyVoucherResponse> {
    const res = await apiClient.get<unknown>(`/reservations/voucher/verify/${token}`)
    return VerifyVoucherResponseSchema.parse(res)
  },
}
