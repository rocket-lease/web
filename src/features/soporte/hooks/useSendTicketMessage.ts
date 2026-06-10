import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListTicketMessagesResponse, TicketMessage } from '@rocket-lease/contracts'
import { ticketMessagesApi } from '../api/ticket-messages.api'
import { ticketMessagesQueryKey } from './useTicketMessages'

export function useSendTicketMessage(
  ticketId: string,
  currentUserId: string,
  channelParticipantId: string,
) {
  const queryClient = useQueryClient()
  const queryKey = ticketMessagesQueryKey(ticketId, channelParticipantId)

  return useMutation({
    mutationFn: (body: string) =>
      ticketMessagesApi.send(ticketId, { body, channelParticipantId }),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ListTicketMessagesResponse>(queryKey)
      const optimistic: TicketMessage = {
        id: crypto.randomUUID(),
        ticketId,
        senderId: currentUserId,
        channelParticipantId,
        messageType: 'user',
        body,
        sentAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ListTicketMessagesResponse>(queryKey, (old) =>
        old ? { ...old, items: [...old.items, optimistic] } : { items: [optimistic] },
      )
      return { previous }
    },
    onError: (_err, _body, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
