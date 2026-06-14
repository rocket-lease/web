import { httpClient } from '@/lib/http-client'
import type {
  ListMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@rocket-lease/contracts'

export const messagingApi = {
  sendMessage: (
    reservationId: string,
    body: SendMessageRequest,
  ): Promise<SendMessageResponse> =>
    httpClient.post(`/reservations/${reservationId}/messages`, body),

  listMessages: (reservationId: string): Promise<ListMessagesResponse> =>
    httpClient.get(`/reservations/${reservationId}/messages`),

  markRead: (reservationId: string, lastReadAt: string): Promise<void> =>
    httpClient.post(`/reservations/${reservationId}/messages/read`, { lastReadAt }),
}
