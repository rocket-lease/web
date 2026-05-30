import { useMutation, useQueryClient } from '@tanstack/react-query'
import { modifyExtension } from '../api/reservations.api'

interface ModifyExtensionVariables {
  extensionId: string
  newEndAt: string
}

/**
 * Mutación para modificar una extensión todavía pendiente (de aprobación o de
 * pago), cambiando su fecha de devolución.
 *
 * Hace PATCH a `/reservations/:id/extend` con el nuevo `endAt`. La respuesta
 * incluye `requiresApproval` y el total recalculado.
 *
 * En `onSuccess` invalida el listado de reservas, el contador de solicitudes y
 * el detalle del padre (refresca la cadena).
 *
 * @returns Mutación de TanStack Query que recibe `{ extensionId, newEndAt }`.
 */
export function useModifyExtension(parentReservationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ extensionId, newEndAt }: ModifyExtensionVariables) =>
      modifyExtension(extensionId, newEndAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservationsCount'] })
      queryClient.invalidateQueries({
        queryKey: ['reservation', parentReservationId],
      })
    },
  })
}
