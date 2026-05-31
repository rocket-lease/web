import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'
import type { ConfirmReservationBalanceRequest } from '@rocket-lease/contracts'

/**
 * US-30: paga el saldo restante de una reserva señada por medio inmediato
 * (tarjeta/billetera). La reserva pasa a 'confirmed'.
 */
export function usePayBalance(reservationId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ConfirmReservationBalanceRequest) => {
      if (!reservationId) {
        return Promise.reject(new Error('reservationId is null'))
      }
      return reservarApi.payBalance(reservationId, data)
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

/** US-30: inicia el pago del saldo por transferencia bancaria. */
export function useInitiateBalanceTransfer(reservationId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      if (!reservationId) {
        return Promise.reject(new Error('reservationId is null'))
      }
      return reservarApi.initiateBalanceTransfer(reservationId)
    },
    onSuccess: () => {
      if (reservationId) {
        queryClient.invalidateQueries({
          queryKey: ['reservation', reservationId],
        })
      }
    },
  })
}
