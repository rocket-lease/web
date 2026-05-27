import { useQuery } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'

const PREFIX = 'rl:chat:lastSeen:'

/** Devuelve el ISO string guardado como "última vez visto" para esta reserva. */
export function getLastSeen(reservationId: string): string | undefined {
  try {
    return localStorage.getItem(PREFIX + reservationId) ?? undefined
  } catch {
    return undefined
  }
}

/** Persiste el momento actual como "última vez visto". Llamar al entrar/salir del chat. */
export function markAsRead(reservationId: string): void {
  try {
    localStorage.setItem(PREFIX + reservationId, new Date().toISOString())
  } catch {}
}

/**
 * Devuelve la cantidad de mensajes recibidos desde la última vez que el
 * usuario abrió el chat de esta reserva.
 *
 * `enabled` debe ser false para reservas que no pueden tener chat
 * (cancelled, expired, etc.) para evitar requests innecesarias.
 */
export function useUnreadCount(reservationId: string, enabled = true) {
  const lastSeen = getLastSeen(reservationId)

  return useQuery({
    queryKey: ['messages', 'unread', reservationId, lastSeen] as const,
    queryFn: () => messagingApi.listMessages(reservationId, lastSeen),
    select: (data) => data.items.length,
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}
