import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmPickup } from '../api/reservations.api'

export function useConfirmPickup(reservationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (voucherToken: string) => confirmPickup(voucherToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
