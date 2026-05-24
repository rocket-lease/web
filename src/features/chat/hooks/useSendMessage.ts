import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'
import { messagesQueryKey } from './useMessages'

export function useSendMessage(reservationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      messagingApi.sendMessage(reservationId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKey(reservationId),
      })
    },
  })
}
