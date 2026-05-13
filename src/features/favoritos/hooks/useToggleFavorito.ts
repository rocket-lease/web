import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { favoritosApi } from '../api/favoritos.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { FavoritoItem } from '../types'

export function useToggleFavorito() {
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const addMutation = useMutation({
    mutationFn: (vehicleId: string) => favoritosApi.add(vehicleId),
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const prev = queryClient.getQueryData<FavoritoItem[]>(['favoritos', 'list'])

      queryClient.setQueryData<FavoritoItem[]>(['favoritos', 'list'], (old = []) => {
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
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const prev = queryClient.getQueryData<FavoritoItem[]>(['favoritos', 'list'])

      queryClient.setQueryData<FavoritoItem[]>(['favoritos', 'list'], (old = []) =>
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
      removeMutation.mutate(vehicleId)
    } else {
      addMutation.mutate(vehicleId)
    }
  }

  const isLoading = addMutation.isPending || removeMutation.isPending

  return { toggle, isLoading }
}
