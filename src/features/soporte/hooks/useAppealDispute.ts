import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disputeApi } from '../api/dispute.api'
import { ticketQueryKey } from './useTicket'

export function useAppealDispute(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) => disputeApi.appeal(ticketId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketQueryKey(ticketId) })
    },
  })
}
