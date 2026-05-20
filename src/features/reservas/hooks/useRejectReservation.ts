import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectReservation } from '../api/reservations.api'

interface RejectReservationVariables {
  reservationId: string
  reason?: string
}

/**
 * Mutación para que el rentador rechace una solicitud de reserva
 * (`pending_approval` → `rejected`), con razón opcional (max 280 chars).
 *
 * En `onSuccess` invalida los listados (`['reservations', ...]`) y el detalle
 * (`['reservation', id]`) para reflejar el nuevo estado.
 *
 * @returns El objeto estándar de tanstack-query `useMutation`. La función
 *   `mutateAsync({ reservationId, reason? })` ejecuta la acción.
 */
export function useRejectReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, reason }: RejectReservationVariables) =>
      rejectReservation(reservationId, reason),
    onSuccess: (_data, { reservationId }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
    },
  })
}
