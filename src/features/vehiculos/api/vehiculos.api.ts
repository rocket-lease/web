import { httpClient } from '@/lib/http-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return httpClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(): Promise<GetVehicleResponse[]> {
    return httpClient.get<GetVehicleResponse[]>('/vehicle')
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    const parseVehicle = GetVehicleResponseSchema as unknown as {
      parse(input: unknown): GetVehicleResponse
    }

    return (res as unknown[]).map(item => parseVehicle.parse(item))
  },
}
