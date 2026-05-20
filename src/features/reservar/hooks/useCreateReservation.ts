import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reservarApi } from '../api/reservar.api'
import type { CreateReservationRequest } from '@rocket-lease/contracts'

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReservationRequest) => reservarApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine'] })
    },
  })
}
