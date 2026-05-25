import { apiClient } from '@/lib/api-client'
import type {
  GetPromotionResponse,
  PromoteVehicleRequest,
  PromoteVehicleResponse,
} from '@rocket-lease/contracts'

export const promocionApi = {
  async getDurations(): Promise<{ days: number; valueInCents: number }[]> {
    return apiClient.get<{ days: number; valueInCents: number }[]>('/promotion/durations')
  },

  async promoteVehicle(vehicleId: string, data: PromoteVehicleRequest): Promise<PromoteVehicleResponse> {
    return apiClient.post<PromoteVehicleResponse>(`/vehicle/${vehicleId}/promotion`, data)
  },

  async getVehiclePromotion(vehicleId: string): Promise<GetPromotionResponse> {
    return apiClient.get<GetPromotionResponse>(`/vehicle/${vehicleId}/promotion`)
  },
}
