import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminTicketsApi } from '../api/admin-tickets.api'
import { ticketQueryKey } from '@/features/soporte/hooks/useTicket'
import type { ResolveTicketRequest } from '@rocket-lease/contracts'

export function useResolveTicket(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: ResolveTicketRequest) => adminTicketsApi.resolve(ticketId, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketQueryKey(ticketId), updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
  })
}
