import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveReservation } from '../api/owner-reservations.api'

/**
 * Mutación para que el rentador apruebe una solicitud de reserva
 * (`pending_approval` → `pending_payment`).
 *
 * En `onSuccess` invalida las caches del panel de reservas del rentador
 * (`['ownerReservations']`) y del detalle del conductor (`['reservation', id]`)
 * para reflejar el nuevo estado sin pedir refresh manual.
 *
 * @returns El objeto estándar de tanstack-query `useMutation`. La función
 *   `mutateAsync(reservationId)` ejecuta la acción y resuelve con el payload
 *   del backend.
 */
export function useApproveReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => approveReservation(reservationId),
    onSuccess: (_data, reservationId) => {
      queryClient.invalidateQueries({ queryKey: ['ownerReservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] })
    },
  })
}
