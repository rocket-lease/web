import { apiClient } from '@/lib/api-client'
import { httpClient } from '@/lib/http-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
} from '@rocket-lease/contracts'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const res = await apiClient.post<CreateVehicleResponse>('/vehicle', data)
    return res
  },

  async getAll(): Promise<GetVehicleResponse[]> {
    return httpClient.get<GetVehicleResponse[]>('/vehicle')
  },
}
