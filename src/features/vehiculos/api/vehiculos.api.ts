import { apiClient } from '@/lib/api-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const res = await apiClient.post<CreateVehicleResponse>('/vehicle', data)
    return res
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    const parseVehicle = GetVehicleResponseSchema as unknown as {
      parse(input: unknown): GetVehicleResponse
    }

    return (res as unknown[]).map(item => parseVehicle.parse(item))
  },
}
