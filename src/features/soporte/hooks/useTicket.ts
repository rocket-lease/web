import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'

export const ticketQueryKey = (ticketId: string) => ['tickets', 'detail', ticketId] as const

export function useTicket(ticketId: string) {
  return useQuery({
    queryKey: ticketQueryKey(ticketId),
    queryFn: () => ticketsApi.getById(ticketId),
    enabled: !!ticketId,
  })
}
