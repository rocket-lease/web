import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authApi } from '../api/auth.api'
import type { VerificationStatusResponse } from '@rocket-lease/contracts'

const QUERY_KEY = ['verificationStatus'] as const

/**
 * Hook que expone el estado de verificación de canales (email, etc.) del
 * usuario autenticado. Cacheado con TanStack Query bajo `['verificationStatus']`
 * — múltiples componentes en pantalla (badge del hero del perfil, fila del
 * panel de configuración) comparten una sola request.
 *
 * `staleTime` 30s: en una sesión activa el dato se considera fresco y no se
 * re-fetcha al navegar. Después de verificar, el caller que dispara el flujo
 * debería invalidar la queryKey via `refetch()` o `queryClient.invalidateQueries`.
 *
 * @returns
 *   - `status`: payload del backend o `null` si todavía no llegó / hubo error.
 *   - `loading`: true mientras la primera request está en vuelo.
 *   - `refetch`: fuerza un re-fetch (útil después de verificar un canal).
 */
export function useVerificationStatus() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<VerificationStatusResponse | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.getVerificationStatus()
      } catch {
        return null
      }
    },
    staleTime: 30_000,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }, [queryClient])

  return {
    status: data ?? null,
    loading: isLoading,
    refetch,
  }
}
