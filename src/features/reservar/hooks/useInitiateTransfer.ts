import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'

export function useInitiateTransfer(reservationId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      if (!reservationId) {
        return Promise.reject(new Error('reservationId is null'))
      }
      return reservarApi.initiateTransfer(reservationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] })
      if (reservationId) {
        queryClient.invalidateQueries({
          queryKey: ['reservation', reservationId],
        })
      }
    },
  })
}
