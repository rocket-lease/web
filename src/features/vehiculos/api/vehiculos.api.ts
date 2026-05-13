import { httpClient } from '@/lib/http-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
  UpdateVehicleRequest,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

const parseVehicle = (input: unknown): GetVehicleResponse => GetVehicleResponseSchema.parse(input)

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return httpClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(): Promise<GetVehicleResponse[]> {
    return httpClient.get<GetVehicleResponse[]>('/vehicle')
  },

  async getVehicleById(vehicleId: string): Promise<GetVehicleResponse> {
    const res = await apiClient.get<unknown>(`/vehicle/${vehicleId}`)
    return parseVehicle(res)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    return GetVehicleResponseSchema.array().parse(res)
  },

  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<void> {
    await apiClient.patch<void>(`/vehicle/${vehicleId}`, data)
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await apiClient.delete<void>(`/vehicle/${vehicleId}`)
  },
}
