import { useMutation, useQueryClient } from '@tanstack/react-query'
import { extendReservation } from '../api/reservations.api'

interface ExtendReservationVariables {
  reservationId: string
  newEndAt: string
}

/**
 * Mutación para solicitar la extensión de una reserva en curso.
 *
 * Hace POST a `/reservations/:id/extend` con el nuevo `endAt`. La respuesta
 * incluye `requiresApproval` para que la UI sepa si la extensión entró como
 * `pending_payment` (cobro inmediato vía hold) o como `pending_approval`
 * (espera la decisión del rentador).
 *
 * En `onSuccess` invalida el listado de reservas (la nueva extensión aparece
 * como un eslabón más del chain) y el detalle del padre (refresca la
 * propiedad `chain`).
 *
 * @returns Mutación de TanStack Query que recibe `{ reservationId, newEndAt }`.
 */
export function useExtendReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, newEndAt }: ExtendReservationVariables) =>
      extendReservation(reservationId, newEndAt),
    onSuccess: (_data, { reservationId }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservationsCount'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
    },
  })
}
