import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'mine'] })
    },
  })
}
