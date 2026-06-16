import { useQuery } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'
import { messagesQueryKey } from './useMessages'

/**
 * Devuelve la cantidad de mensajes recibidos desde la última vez que el
 * usuario abrió el chat de esta reserva, usando el lastSeenAt persistido
 * en el servidor.
 *
 * Comparte el queryKey de useMessages para aprovechar el cache de TanStack
 * Query: si ChatWindow ya hizo el fetch, este hook no genera un request extra.
 *
 * `enabled` debe ser false para reservas que no pueden tener chat
 * (cancelled, expired, etc.) para evitar requests innecesarias.
 */
export function useUnreadCount(reservationId: string, enabled = true) {
  return useQuery({
    queryKey: messagesQueryKey(reservationId),
    queryFn: () => messagingApi.listMessages(reservationId),
    select: (data) => {
      if (!data.lastSeenAt) return 0
      return data.items.filter((m) => m.sentAt > data.lastSeenAt!).length
    },
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}
