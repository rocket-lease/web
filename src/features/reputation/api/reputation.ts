import { apiClient } from '@/lib/api-client'
import type { GetReputationResponse } from '@rocket-lease/contracts'

export const reputationApi = {
  get: (userId: string) => apiClient.get<GetReputationResponse>(`/reputation/${userId}`),
}
