import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectReservation } from '../api/owner-reservations.api'

interface RejectReservationVariables {
  reservationId: string
  reason?: string
}

/**
 * Mutación para que el rentador rechace una solicitud de reserva
 * (`pending_approval` → `rejected`), con razón opcional (max 280 chars).
 *
 * En `onSuccess` invalida las caches del panel del rentador y del detalle
 * del conductor.
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
      queryClient.invalidateQueries({ queryKey: ['ownerReservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] })
    },
  })
}
