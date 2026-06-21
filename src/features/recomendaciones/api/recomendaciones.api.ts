import { httpClient } from '@/lib/http-client'
import type { RecommendedVehiclesResponse } from '@rocket-lease/contracts'

export const recomendacionesApi = {
  async getRecommendations(): Promise<RecommendedVehiclesResponse> {
    return httpClient.get<RecommendedVehiclesResponse>('/recommendations')
  },
}
