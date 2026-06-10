import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/features/soporte/api/tickets.api'
import { ticketQueryKey } from '@/features/soporte/hooks/useTicket'
import type { UpdateTicketStatusRequest } from '@rocket-lease/contracts'

export function useAdminUpdateStatus(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateTicketStatusRequest) =>
      ticketsApi.adminUpdateStatus(ticketId, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketQueryKey(ticketId), updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
  })
}
