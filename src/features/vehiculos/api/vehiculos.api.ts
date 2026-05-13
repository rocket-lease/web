import { apiClient } from '@/lib/api-client'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse
} from '@rocket-lease/contracts'

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>


const parseVehicle = (input: unknown): GetVehicleResponse => GetVehicleResponseSchema.parse(input)

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return await apiClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(): Promise<GetVehicleResponse[]> {
    return await apiClient.get<GetVehicleResponse[]>('/vehicle')
  },

  async getById(id: string): Promise<GetVehicleResponse> {
    return await apiClient.get<GetVehicleResponse>(`/vehicle/${id}`)
  },

  async getVehicleById(vehicleId: string): Promise<GetVehicleResponse> {
    const res = await apiClient.get<unknown>(`/vehicle/${vehicleId}`)
    return parseVehicle(res)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    return (res as unknown[]).map(parseVehicle)
  },

  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<void> {
    await apiClient.patch<void>(`/vehicle/${vehicleId}`, data)
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await apiClient.delete<void>(`/vehicle/${vehicleId}`)
  },
}
