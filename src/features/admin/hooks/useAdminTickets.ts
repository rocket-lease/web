import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '@/features/soporte/api/tickets.api'

export function useAdminTickets() {
  return useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => ticketsApi.adminGetQueue(),
    retry: 1,
  })
}
