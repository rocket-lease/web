import {
  GetAdminTicketsResponseSchema,
  GetMyTicketsResponseSchema,
  GetReservationTicketsResponseSchema,
  GetTicketsAgainstMeResponseSchema,
  TicketResponseSchema,
  UploadSignResponseSchema,
  type CreateTicketRequest,
  type GetAdminTicketsResponse,
  type GetMyTicketsResponse,
  type GetReservationTicketsResponse,
  type GetTicketsAgainstMeResponse,
  type RateTicketRequest,
  type TicketResponse,
  type UpdateTicketStatusRequest,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const ticketsApi = {
  async create(data: CreateTicketRequest): Promise<TicketResponse> {
    return TicketResponseSchema.parse(await apiClient.post('/tickets', data))
  },

  async getById(ticketId: string): Promise<TicketResponse> {
    return TicketResponseSchema.parse(await apiClient.get(`/tickets/${ticketId}`))
  },

  async getMine(): Promise<GetMyTicketsResponse> {
    return GetMyTicketsResponseSchema.parse(await apiClient.get('/tickets/mine'))
  },

  async getAgainstMe(): Promise<GetTicketsAgainstMeResponse> {
    return GetTicketsAgainstMeResponseSchema.parse(await apiClient.get('/tickets/against-me'))
  },

  async getByReservation(reservationId: string): Promise<GetReservationTicketsResponse> {
    return GetReservationTicketsResponseSchema.parse(
      await apiClient.get(`/tickets/reservation/${reservationId}`),
    )
  },

  async rateTicket(ticketId: string, data: RateTicketRequest): Promise<TicketResponse> {
    return TicketResponseSchema.parse(await apiClient.post(`/tickets/${ticketId}/rating`, data))
  },

  async adminGetQueue(): Promise<GetAdminTicketsResponse> {
    return GetAdminTicketsResponseSchema.parse(await apiClient.get('/admin/tickets'))
  },

  async adminUpdateStatus(ticketId: string, data: UpdateTicketStatusRequest): Promise<TicketResponse> {
    return TicketResponseSchema.parse(await apiClient.patch(`/admin/tickets/${ticketId}/status`, data))
  },

  async uploadPhoto(file: File): Promise<string> {
    const signed = UploadSignResponseSchema.parse(
      await apiClient.post('/uploads/sign', {
        resourceType: 'image',
        folder: 'rocket-lease/ticket-photos',
      }),
    )
    const formData = new FormData()
    Object.entries(signed.fields).forEach(([k, v]) => formData.append(k, v))
    formData.append('file', file)
    const res = await fetch(signed.uploadUrl, { method: 'POST', body: formData })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    const json = (await res.json()) as { secure_url?: string }
    if (!json.secure_url) throw new Error('Upload response missing secure_url')
    return json.secure_url
  },
}
