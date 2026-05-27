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

  listMessages: (
    reservationId: string,
    after?: string,
  ): Promise<ListMessagesResponse> => {
    const url = after
      ? `/reservations/${reservationId}/messages?after=${encodeURIComponent(after)}`
      : `/reservations/${reservationId}/messages`
    return httpClient.get(url)
  },
}
