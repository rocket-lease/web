import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { favoritosApi } from '../api/favoritos.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'
import type { FavoriteItem } from '@rocket-lease/contracts'

export function useToggleFavorito() {
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const addMutation = useMutation({
    mutationFn: (vehicleId: string) => favoritosApi.add(vehicleId),
    onMutate: (vehicleId) => {
      queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const prev = queryClient.getQueryData<FavoriteItem[]>(['favoritos', 'list'])

      queryClient.setQueryData<FavoriteItem[]>(['favoritos', 'list'], (old = []) => {
        if (old.some((f) => f.vehicleId === vehicleId)) return old
        return [
          ...old,
          { id: `optimistic-${vehicleId}`, vehicleId, createdAt: new Date().toISOString() },
        ]
      })

      return { prev }
    },
    onError: (err, _vehicleId, ctx) => {
      // 409 = already a fav server-side; keep optimistic (UI correct)
      const status = (err as { status?: number })?.status
      if (status === 409) return
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(['favoritos', 'list'], ctx.prev)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favoritos', 'list'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (vehicleId: string) => favoritosApi.remove(vehicleId),
    onMutate: (vehicleId) => {
      queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const prev = queryClient.getQueryData<FavoriteItem[]>(['favoritos', 'list'])

      queryClient.setQueryData<FavoriteItem[]>(['favoritos', 'list'], (old = []) =>
        old.filter((f) => f.vehicleId !== vehicleId),
      )

      return { prev }
    },
    onError: (err, _vehicleId, ctx) => {
      // 404 = already removed server-side; keep optimistic (UI correct)
      const status = (err as { status?: number })?.status
      if (status === 404) return
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(['favoritos', 'list'], ctx.prev)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favoritos', 'list'] }),
  })

  const toggle = (vehicleId: string, isFavorito: boolean) => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login', search: { hint: 'favoritos' } })
      return
    }
    if (isFavorito) {
      toast.success(t('favoritos.toast.removed'))
      removeMutation.mutate(vehicleId, {
        onError: (err) => {
          const status = (err as { status?: number })?.status
          if (status !== 404) toast.error(t('favoritos.toast.error'))
        },
      })
    } else {
      toast.success(t('favoritos.toast.added'))
      addMutation.mutate(vehicleId, {
        onError: (err) => {
          const status = (err as { status?: number })?.status
          if (status !== 409) toast.error(t('favoritos.toast.error'))
        },
      })
    }
  }

  const isLoading = addMutation.isPending || removeMutation.isPending

  return { toggle, isLoading }
}
