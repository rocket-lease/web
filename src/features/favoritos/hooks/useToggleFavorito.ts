import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { favoritosApi } from '../api/favoritos.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'
import type { FavoriteItem } from '@rocket-lease/contracts'

const UNDO_DELAY_MS = 3500

export function useToggleFavorito() {
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const pendingTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current !== undefined) {
        window.clearTimeout(pendingTimerRef.current)
      }
    }
  }, [])

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

  const toggle = (vehicleId: string, isFavorito: boolean) => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login', search: { hint: 'favoritos' } })
      return
    }

    if (isFavorito) {
      // Optimistic removal: update UI immediately for snappy feedback
      queryClient.cancelQueries({ queryKey: ['favoritos', 'list'] })
      const snapshot = queryClient.getQueryData<FavoriteItem[]>(['favoritos', 'list'])
      queryClient.setQueryData<FavoriteItem[]>(['favoritos', 'list'], (old = []) =>
        old.filter((f) => f.vehicleId !== vehicleId),
      )

      // Delay the actual DELETE so the user can undo within the toast window
      let undone = false
      const timer = window.setTimeout(async () => {
        pendingTimerRef.current = undefined
        if (undone) return
        try {
          await favoritosApi.remove(vehicleId)
        } catch (err) {
          const status = (err as { status?: number })?.status
          if (status !== 404) {
            toast.error(t('favoritos.toast.error'))
            if (snapshot !== undefined) queryClient.setQueryData(['favoritos', 'list'], snapshot)
          }
        } finally {
          if (!undone) queryClient.invalidateQueries({ queryKey: ['favoritos', 'list'] })
        }
      }, UNDO_DELAY_MS)
      pendingTimerRef.current = timer

      toast(t('favoritos.toast.removed'), {
        duration: UNDO_DELAY_MS,
        action: {
          label: t('favoritos.toast.undo'),
          onClick: () => {
            undone = true
            window.clearTimeout(timer)
            pendingTimerRef.current = undefined
            if (snapshot !== undefined) queryClient.setQueryData(['favoritos', 'list'], snapshot)
            queryClient.invalidateQueries({ queryKey: ['favoritos', 'list'] })
          },
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

  return { toggle, isLoading: addMutation.isPending }
}
