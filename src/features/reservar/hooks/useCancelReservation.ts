import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'

/**
 * Mutación para que el conductor cancele/retire su propia reserva.
 *
 * Mismo endpoint (`POST /reservations/:id/cancel`) sirve para retirar una
 * solicitud `pending_approval` o cancelar una `pending_payment`. En US-40
 * el caller que se usa para retirar pasa por el modal anti-misclick estilo
 * "withdraw" de Airbnb.
 *
 * En `onSuccess` invalida el listado del conductor y el detalle.
 */
export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => reservarApi.cancel(reservationId),
    onSuccess: (_data, reservationId) => {
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['ownerReservations'] })
    },
  })
}
