import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profileApi } from '@/features/perfil/api/profile.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { GetMyProfileResponse } from '@/features/perfil/types/profile.contract'
import { t } from '@/i18n/es'

const profileQueryKey = ['profile', 'me'] as const

/**
 * Toggle optimista del flag `autoAccept` del perfil. La UI flip-ea
 * instantáneamente con `setQueryData`, dispara un toast de éxito, y la
 * mutación va al servidor en background. Si el server rechaza, revertimos
 * la cache y mostramos un toast de error. `onSettled` re-invalida para
 * resync con la verdad del servidor.
 *
 * Patrón espejo de `useToggleFavorito` — apropiado para toggles binarios
 * donde el costo de revertir un fallo (raro) es menor que la fricción de
 * esperar al servidor en cada click.
 *
 * @returns
 *   - `toggle`: dispara la mutación con el nuevo valor.
 *   - `isPending`: true mientras hay una mutación en vuelo (informativo,
 *     no necesario para disabled — el patrón optimista no requiere bloquear).
 */
export function useToggleAutoAccept() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const accessToken =
    session?.access_token ?? localStorage.getItem('rocket_lease:access_token')

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const current = queryClient.getQueryData<GetMyProfileResponse>(profileQueryKey)
      if (!current) throw new Error('No profile loaded')
      if (!accessToken) throw new Error('Missing session token')
      return profileApi.updateMyProfile(accessToken, {
        name: current.name,
        phone: current.phone,
        avatarUrl: current.avatarUrl,
        preferences: current.preferences,
        autoAccept: next,
      })
    },
    onMutate: async (next: boolean) => {
      await queryClient.cancelQueries({ queryKey: profileQueryKey })
      const prev = queryClient.getQueryData<GetMyProfileResponse>(profileQueryKey)
      if (prev) {
        queryClient.setQueryData<GetMyProfileResponse>(profileQueryKey, {
          ...prev,
          autoAccept: next,
        })
      }
      return { prev }
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(profileQueryKey, ctx.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey })
    },
  })

  const toggle = (next: boolean) => {
    toast.success(
      next
        ? t('configuracion.autoAccept.toast.on')
        : t('configuracion.autoAccept.toast.off'),
    )
    mutation.mutate(next, {
      onError: () => toast.error(t('error.default')),
    })
  }

  return { toggle, isPending: mutation.isPending }
}
