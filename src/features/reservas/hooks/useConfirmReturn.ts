import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmReturn } from '../api/reservations.api'

export function useConfirmReturn(reservationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (returnQrToken: string) => confirmReturn(returnQrToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
