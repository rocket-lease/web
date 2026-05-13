import { apiClient } from '@/lib/api-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
} from '@rocket-lease/contracts'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const res = await apiClient.post<CreateVehicleResponse>('/vehicle', data)
    return res
  },
}
