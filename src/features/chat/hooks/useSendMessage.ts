import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListMessagesResponse, Message } from '@rocket-lease/contracts'
import { messagingApi } from '../api/messaging.api'
import { messagesQueryKey } from './useMessages'

/**
 * Envía un mensaje aplicando optimistic update: el mensaje aparece en la lista
 * apenas el usuario lo manda, antes de que el servidor confirme. Si la mutación
 * falla, se hace rollback al snapshot previo y la entrega real llega cuando
 * el siguiente refetch lo reconcilia.
 */
export function useSendMessage(reservationId: string, currentUserId: string) {
  const queryClient = useQueryClient()
  const queryKey = messagesQueryKey(reservationId)

  return useMutation({
    mutationFn: (body: string) =>
      messagingApi.sendMessage(reservationId, { body }),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ListMessagesResponse>(queryKey)
      const optimistic: Message = {
        id: crypto.randomUUID(),
        reservationId,
        senderId: currentUserId,
        body,
        sentAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ListMessagesResponse>(queryKey, (old) =>
        old
          ? { ...old, items: [...old.items, optimistic] }
          : { items: [optimistic], lastSeenAt: null },
      )
      return { previous }
    },
    onError: (_err, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
