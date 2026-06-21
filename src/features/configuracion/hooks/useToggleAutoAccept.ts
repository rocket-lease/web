import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profileApi } from '@/features/perfil/api/profile.api'
import type { GetMyProfileResponse } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { getErrorMessage } from '@/lib/error-mapper'

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

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const current = queryClient.getQueryData<GetMyProfileResponse>(profileQueryKey)
      if (!current) throw new Error('No profile loaded')
      return profileApi.updateMyProfile({
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
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  }

  return { toggle, isPending: mutation.isPending }
}
