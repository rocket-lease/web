import { apiClient } from '@/lib/api-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

interface GetAllParams {
  city?: string
  from?: string
  to?: string
}

const buildQuery = ({ city, from, to }: GetAllParams): string => {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
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
    const query = buildQuery(params)
    const res = await apiClient.get<unknown>(`/vehicle${query}`)
    return GetVehicleResponseSchema.array().parse(res)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    return GetVehicleResponseSchema.array().parse(res)
  },
}
