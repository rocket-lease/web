import type {
  AppealDisputeRequest,
  DisputeResolutionResponse,
  IssueDisputeVerdictRequest,
  RequestDisputeInfoRequest,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'

export const disputeApi = {
  async getByTicketId(ticketId: string): Promise<DisputeResolutionResponse | null> {
    return apiClient.get<DisputeResolutionResponse | null>(`/admin/tickets/${ticketId}/dispute`)
  },

  async escalate(ticketId: string): Promise<DisputeResolutionResponse> {
    return apiClient.post(`/admin/tickets/${ticketId}/dispute/escalate`, {})
  },

  async requestInfo(ticketId: string, data: RequestDisputeInfoRequest): Promise<DisputeResolutionResponse> {
    return apiClient.post(`/admin/tickets/${ticketId}/dispute/request-info`, data)
  },

  async issueVerdict(ticketId: string, data: IssueDisputeVerdictRequest): Promise<DisputeResolutionResponse> {
    return apiClient.post(`/admin/tickets/${ticketId}/dispute/verdict`, data)
  },

  async appeal(ticketId: string, data: AppealDisputeRequest): Promise<DisputeResolutionResponse> {
    return apiClient.post(`/tickets/${ticketId}/dispute/appeal`, data)
  },
}
