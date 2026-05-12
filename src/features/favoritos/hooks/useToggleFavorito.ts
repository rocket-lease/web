import { useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritosApi } from '../api/favoritos.api'
import type { FavoritoItem } from '../types'

export function useToggleFavorito() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (vehicleId: string) => favoritosApi.add(vehicleId),
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const prev = queryClient.getQueryData<FavoritoItem[]>(['favoritos', 'list'])

      queryClient.setQueryData<FavoritoItem[]>(['favoritos', 'list'], (old = []) => [
        ...old,
        { id: `optimistic-${vehicleId}`, vehicleId, createdAt: new Date().toISOString() },
      ])

      return { prev }
    },
    onError: (_err, _vehicleId, ctx) => {
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
    onError: (_err, _vehicleId, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(['favoritos', 'list'], ctx.prev)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favoritos', 'list'] }),
  })

  const toggle = (vehicleId: string, isFavorito: boolean) => {
    if (isFavorito) {
      removeMutation.mutate(vehicleId)
    } else {
      addMutation.mutate(vehicleId)
    }
  }

  const isLoading = addMutation.isPending || removeMutation.isPending

  return { toggle, isLoading }
}
