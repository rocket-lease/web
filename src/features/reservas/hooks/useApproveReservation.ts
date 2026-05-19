import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveReservation } from '../api/reservations.api'

/**
 * Mutación para que el rentador apruebe una solicitud de reserva
 * (`pending_approval` → `pending_payment`).
 *
 * En `onSuccess` invalida la cache de listados (`['reservations', ...]`,
 * particionada por filtros — invalidar el prefijo barre todos los splits)
 * y el detalle (`['reservation', id]`), de modo que el panel y la pantalla
 * de detalle reflejen el nuevo estado sin pedir refresh manual.
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
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
    },
  })
}
