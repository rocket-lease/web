import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'
import { ticketQueryKey } from './useTicket'

export function useRateTicket(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rating: number) => ticketsApi.rateTicket(ticketId, { rating }),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketQueryKey(ticketId), updated)
    },
  })
}
