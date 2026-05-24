import { useQuery } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'

export const messagesQueryKey = (reservationId: string) =>
  ['messages', reservationId] as const

export function useMessages(reservationId: string) {
  return useQuery({
    queryKey: messagesQueryKey(reservationId),
    queryFn: () => messagingApi.listMessages(reservationId),
    refetchInterval: 5_000,
    staleTime: 0,
  })
}
