import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'
import type { InitiateTransferRequest } from '@rocket-lease/contracts'

export function useInitiateTransfer(reservationId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InitiateTransferRequest = {}) => {
      if (!reservationId) {
        return Promise.reject(new Error('reservationId is null'))
      }
      return reservarApi.initiateTransfer(reservationId, data)
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
