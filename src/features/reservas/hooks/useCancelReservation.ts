import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelReservation } from '../api/reservations.api'

interface CancelReservationVariables {
  reservationId: string
  reason?: string
}

/**
 * Mutación para que el rentador cancele una reserva confirmada.
 *
 * En `onSuccess` invalida los listados (`['reservations', ...]`) y el detalle
 * (`['reservation', id]`) para reflejar el nuevo estado.
 *
 * @returns El objeto estándar de tanstack-query `useMutation`. La función
 *   `mutateAsync({ reservationId, reason? })` ejecuta la acción.
 */
export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, reason }: CancelReservationVariables) =>
      cancelReservation(reservationId, reason),
    onSuccess: (_data, { reservationId }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
