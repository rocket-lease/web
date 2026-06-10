import { apiClient } from '@/lib/api-client'
import { GeoLocationsResponseSchema } from '@rocket-lease/contracts'
import type { GeoLocationOption, GeoLocationsResponse } from '@rocket-lease/contracts'

export const locationsApi = {
  async listSearchLocations(): Promise<GeoLocationOption[]> {
    const res = await apiClient.get<unknown>('/geo/locations')
    return GeoLocationsResponseSchema.parse(res).locations
  },
}

export type { GeoLocationOption, GeoLocationsResponse }
