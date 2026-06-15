import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminTicketsApi } from '../api/admin-tickets.api'
import { ticketQueryKey } from '@/features/soporte/hooks/useTicket'

export function useAdminUpdateStatus(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminTicketsApi.markUnderReview(ticketId),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketQueryKey(ticketId), updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
  })
}
