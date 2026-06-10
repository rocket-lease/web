import type {
  ListTicketMessagesResponse,
  SendTicketMessageRequest,
  SendTicketMessageResponse,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const ticketMessagesApi = {
  async send(ticketId: string, data: SendTicketMessageRequest): Promise<SendTicketMessageResponse> {
    return apiClient.post(`/tickets/${ticketId}/messages`, data)
  },

  async list(ticketId: string, channelParticipantId: string, after?: string): Promise<ListTicketMessagesResponse> {
    const params = new URLSearchParams({ party: channelParticipantId })
    if (after) params.set('after', after)
    return apiClient.get<ListTicketMessagesResponse>(`/tickets/${ticketId}/messages?${params.toString()}`)
  },
}
