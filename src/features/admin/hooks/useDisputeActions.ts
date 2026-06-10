import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disputeApi } from '@/features/soporte/api/dispute.api'
import { ticketQueryKey } from '@/features/soporte/hooks/useTicket'
import { disputeQueryKey } from './useTicketDispute'
import type {
  DisputeResolutionResponse,
  IssueDisputeVerdictRequest,
  RequestDisputeInfoRequest,
} from '@rocket-lease/contracts'

export function useDisputeActions(ticketId: string) {
  const queryClient = useQueryClient()

  const invalidate = (updated?: DisputeResolutionResponse) => {
    if (updated) {
      queryClient.setQueryData(disputeQueryKey(ticketId), updated)
    } else {
      void queryClient.invalidateQueries({ queryKey: disputeQueryKey(ticketId) })
    }
    void queryClient.invalidateQueries({ queryKey: ticketQueryKey(ticketId) })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
  }

  const escalate = useMutation<DisputeResolutionResponse, Error, void>({
    mutationFn: () => disputeApi.escalate(ticketId),
    onSuccess: (updated) => invalidate(updated),
  })

  const requestInfo = useMutation<DisputeResolutionResponse, Error, RequestDisputeInfoRequest>({
    mutationFn: (dto) => disputeApi.requestInfo(ticketId, dto),
    onSuccess: (updated) => invalidate(updated),
  })

  const issueVerdict = useMutation<DisputeResolutionResponse, Error, IssueDisputeVerdictRequest>({
    mutationFn: (dto) => disputeApi.issueVerdict(ticketId, dto),
    onSuccess: (updated) => invalidate(updated),
  })

  return { escalate, requestInfo, issueVerdict }
}
