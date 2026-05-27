import { useQuery } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'

export const messagesQueryKey = (reservationId: string) =>
  ['messages', reservationId] as const

/**
 * Lista de mensajes de una reserva con polling activo. El polling se pausa
 * automáticamente cuando la pestaña pierde el foco para no consumir batería ni
 * cuota de API mientras el usuario no está mirando el chat.
 */
export function useMessages(reservationId: string) {
  return useQuery({
    queryKey: messagesQueryKey(reservationId),
    queryFn: () => messagingApi.listMessages(reservationId),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}
