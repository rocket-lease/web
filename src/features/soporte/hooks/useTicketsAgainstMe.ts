import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'

export function useTicketsAgainstMe() {
  return useQuery({
    queryKey: ['tickets', 'against-me'],
    queryFn: ticketsApi.getAgainstMe,
  })
}
