import { apiClient } from '@/lib/api-client'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'
import type {
  Characteristic,
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
  UpdateVehicleRequest,
} from '@rocket-lease/contracts'

export type { UpdateVehicleRequest }

const parseVehicle = (input: unknown): GetVehicleResponse => GetVehicleResponseSchema.parse(input)
const parseVehicles = (input: unknown): GetVehicleResponse[] => GetVehicleResponseSchema.array().parse(input)

interface GetAllParams {
  characteristics?: Characteristic[]
  from?: string
  to?: string
}

const buildVehicleQuery = ({ characteristics, from, to }: GetAllParams): string => {
  const params = new URLSearchParams()
  if (characteristics && characteristics.length > 0) {
    params.set('characteristics', characteristics.join(','))
  }
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return apiClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(params: GetAllParams = {}): Promise<GetVehicleResponse[]> {
    const query = buildVehicleQuery(params)
    const res = await apiClient.get<unknown>(`/vehicle${query}`)
    return parseVehicles(res)
  },

  async getByOwnerId(ownerId: string): Promise<GetVehicleResponse[]> {
    const params = new URLSearchParams({ ownerId })
    const res = await apiClient.get<unknown>(`/vehicle?${params.toString()}`)
    return parseVehicles(res)
  },

  async getById(id: string): Promise<GetVehicleResponse> {
    const res = await apiClient.get<unknown>(`/vehicle/${id}`)
    return parseVehicle(res)
  },

  async getVehicleById(vehicleId: string): Promise<GetVehicleResponse> {
    return this.getById(vehicleId)
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
