import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: ticketsApi.getMine,
  })
}
