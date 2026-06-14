import { useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging.api'
import { useAuth } from '@/features/auth/hooks/useAuth'

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
  const { isAuthenticated } = useAuth()
  const stored = getLastSeen(reservationId)

  // Temp fix (web#114): si no hay baseline en localStorage pero el usuario está
  // autenticado, sembramos "ahora" para que los mensajes existentes no aparezcan
  // todos como no leídos en cada carga fresca. Fix definitivo: api#110.
  const lastSeen = useMemo(() => {
    if (stored) return stored
    if (isAuthenticated) return new Date().toISOString()
    return undefined
  }, [stored, isAuthenticated])

  // Persiste el baseline computado para que la próxima carga use el valor guardado
  useEffect(() => {
    if (!stored && isAuthenticated && lastSeen) {
      try {
        localStorage.setItem(PREFIX + reservationId, lastSeen)
      } catch {}
    }
  }, [stored, isAuthenticated, lastSeen, reservationId])

  return useQuery({
    queryKey: ['messages', 'unread', reservationId, lastSeen] as const,
    queryFn: () => messagingApi.listMessages(reservationId, lastSeen),
    select: (data) => data.items.length,
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}
