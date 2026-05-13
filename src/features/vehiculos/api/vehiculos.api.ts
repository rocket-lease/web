import { apiClient } from '@/lib/api-client'
import type {
  Characteristic,
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
  UpdateVehicleRequest,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

const parseVehicle = (input: unknown): GetVehicleResponse => GetVehicleResponseSchema.parse(input)
const parseVehicles = (input: unknown): GetVehicleResponse[] => GetVehicleResponseSchema.array().parse(input)

const buildCharacteristicsQuery = (characteristics?: Characteristic[]) => {
  if (!characteristics || characteristics.length === 0) return ''
  const params = new URLSearchParams()
  params.set('characteristics', characteristics.join(','))
  return `?${params.toString()}`
}

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return apiClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(characteristics?: Characteristic[]): Promise<GetVehicleResponse[]> {
    const query = buildCharacteristicsQuery(characteristics)
    const res = await apiClient.get<unknown>(`/vehicle${query}`)
    return parseVehicles(res)
  },

  async getVehicleById(vehicleId: string): Promise<GetVehicleResponse> {
    const res = await apiClient.get<unknown>(`/vehicle/${vehicleId}`)
    return parseVehicle(res)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    return parseVehicles(res)
  },

  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<void> {
    await apiClient.patch<void>(`/vehicle/${vehicleId}`, data)
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await apiClient.delete<void>(`/vehicle/${vehicleId}`)
  },
}
