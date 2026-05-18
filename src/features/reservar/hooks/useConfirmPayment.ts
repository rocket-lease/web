import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'
import type { ConfirmReservationPaymentRequest } from '@rocket-lease/contracts'

export function useConfirmPayment(reservationId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ConfirmReservationPaymentRequest) => {
      if (!reservationId) {
        return Promise.reject(new Error('reservationId is null'))
      }
      return reservarApi.confirmPayment(reservationId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservationsCount'] })
      if (reservationId) {
        queryClient.invalidateQueries({
          queryKey: ['reservation', reservationId],
        })
      }
    },
  })
}
