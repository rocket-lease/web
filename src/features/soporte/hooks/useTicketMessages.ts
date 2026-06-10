import { useQuery } from '@tanstack/react-query'
import { ticketMessagesApi } from '../api/ticket-messages.api'

export const ticketMessagesQueryKey = (ticketId: string, channelParticipantId: string) =>
  ['ticket-messages', ticketId, channelParticipantId] as const

export function useTicketMessages(ticketId: string, channelParticipantId: string) {
  return useQuery({
    queryKey: ticketMessagesQueryKey(ticketId, channelParticipantId),
    queryFn: () => ticketMessagesApi.list(ticketId, channelParticipantId),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    enabled: !!ticketId && !!channelParticipantId,
  })
}
