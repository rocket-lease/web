import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'

/**
 * Mutación para que el conductor cancele/retire su propia reserva.
 *
 * Mismo endpoint (`POST /reservations/:id/cancel`) sirve para retirar una
 * solicitud `pending_approval` o cancelar una `pending_payment`.
 *
 * En `onSuccess` invalida el listado del conductor y el detalle.
 *
 * @returns Mutación de TanStack Query que recibe el `reservationId` como
 *   variable y resuelve cuando la reserva queda en `cancelled`.
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
