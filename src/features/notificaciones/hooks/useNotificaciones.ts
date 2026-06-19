import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificacionesApi } from '../api/notificaciones.api'
import { useAuth } from '@/features/auth/hooks/useAuth'

const NOTIFICACIONES_KEY = ['notificaciones'] as const

/**
 * Refleja el conteo de no leídas en el badge del ícono de la app (soportado en
 * PWAs instaladas, incluido iOS 16.4+). No-op si el navegador no lo soporta.
 */
function syncAppBadge(unreadCount: number | undefined) {
  const nav = navigator as Navigator & {
    setAppBadge?: (count?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
  if (!nav.setAppBadge || unreadCount === undefined) return
  if (unreadCount > 0) void nav.setAppBadge(unreadCount)
  else void nav.clearAppBadge?.()
}

/**
 * Lista las notificaciones del centro in-app junto con el conteo de no leídas.
 */
export function useNotificaciones() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...NOTIFICACIONES_KEY, 'list'],
    queryFn: notificacionesApi.list,
    enabled: isAuthenticated,
  })
}

/**
 * Conteo de notificaciones no leídas para el badge de navegación. Refresca en
 * segundo plano para mantener el badge al día sin abrir el centro.
 */
export function useUnreadNotificaciones() {
  const { isAuthenticated } = useAuth()
  const query = useQuery({
    queryKey: [...NOTIFICACIONES_KEY, 'unread'],
    queryFn: notificacionesApi.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    select: data => data.unreadCount,
  })

  useEffect(() => {
    syncAppBadge(isAuthenticated ? query.data : 0)
  }, [isAuthenticated, query.data])

  return query
}

/**
 * Mutaciones para marcar una notificación (o todas) como leídas. Invalida tanto
 * el listado como el conteo del badge al completarse.
 */
export function useMarkNotificaciones() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_KEY })

  const markRead = useMutation({
    mutationFn: (id: string) => notificacionesApi.markRead(id),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: () => notificacionesApi.markAllRead(),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}
