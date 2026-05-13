import { httpClient } from '@/lib/http-client'
import type {
  CreateVehicleRequest,
  CreateVehicleResponse,
  GetVehicleResponse,
  SearchVehiclesQuery,
  SearchVehiclesResponse,
} from '@rocket-lease/contracts'
import { GetVehicleResponseSchema } from '@rocket-lease/contracts'

export const vehiclesApi = {
  async publishVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    return httpClient.post<CreateVehicleResponse>('/vehicle', data)
  },

  async getAll(): Promise<GetVehicleResponse[]> {
    return httpClient.get<GetVehicleResponse[]>('/vehicle')
  },

  async search(params: SearchVehiclesQuery): Promise<SearchVehiclesResponse> {
    const searchParams = new URLSearchParams({ city: params.city })
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    return httpClient.get<SearchVehiclesResponse>(`/vehicle/search?${searchParams.toString()}`)
  },

  async getMyVehicles(): Promise<GetVehicleResponse[]> {
    const res = await apiClient.get<unknown>('/vehicle/mine')
    const parseVehicle = GetVehicleResponseSchema as unknown as {
      parse(input: unknown): GetVehicleResponse
    }

    return (res as unknown[]).map(item => parseVehicle.parse(item))
  },
}
