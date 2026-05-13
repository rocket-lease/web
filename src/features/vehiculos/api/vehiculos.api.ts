import { httpClient } from '@/lib/http-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
} from '@rocket-lease/contracts'

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>
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
    const res = await httpClient.get<unknown>(`/vehicle/${vehicleId}`)
    return parseVehicle(res)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await httpClient.get<unknown>('/vehicle/mine')
    return (res as unknown[]).map(parseVehicle)
  },

  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<void> {
    await httpClient.patch<void>(`/vehicle/${vehicleId}`, data)
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await httpClient.delete<void>(`/vehicle/${vehicleId}`)
  },
}
