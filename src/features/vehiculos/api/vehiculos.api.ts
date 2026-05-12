import { apiClient } from '@/lib/api-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
} from '@rocket-lease/contracts'

const TOKEN_KEY = 'rocket_lease:access_token'
const REFRESH_KEY = 'rocket_lease:refresh_token'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const res = await apiClient.post<CreateVehicleResponse>('/vehicle', data)
    return res
  },
}
