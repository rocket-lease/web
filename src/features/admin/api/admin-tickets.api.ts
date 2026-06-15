import { apiClient } from '@/lib/api-client'
import type { ResolveTicketRequest, TicketResponse } from '@rocket-lease/contracts'

export const adminTicketsApi = {
  resolve: (ticketId: string, dto: ResolveTicketRequest) =>
    apiClient.post<TicketResponse>(`/admin/tickets/${ticketId}/resolve`, dto),

  markUnderReview: (ticketId: string) =>
    apiClient.patch<TicketResponse>(`/admin/tickets/${ticketId}/mark-under-review`, {}),
}
