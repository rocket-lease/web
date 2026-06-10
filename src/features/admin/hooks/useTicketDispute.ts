import { useQuery } from '@tanstack/react-query'
import { disputeApi } from '@/features/soporte/api/dispute.api'

export function disputeQueryKey(ticketId: string) {
  return ['admin', 'tickets', ticketId, 'dispute'] as const
}

export function useTicketDispute(ticketId: string) {
  return useQuery({
    queryKey: disputeQueryKey(ticketId),
    queryFn: () => disputeApi.getByTicketId(ticketId),
  })
}
