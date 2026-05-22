import { apiClient } from '@/lib/api-client'
import { MapSearchResponseSchema } from '@rocket-lease/contracts'
import type {
  Characteristic,
  MapSearchResponse,
} from '@rocket-lease/contracts'

export type Transmission = 'Manual' | 'Automatico' | 'Semiautomatico'

export interface MapBoundsParam {
  north: number
  south: number
  east: number
  west: number
}

export interface MapSearchParams {
  bounds?: MapBoundsParam
  center?: { lat: number; lng: number }
  radiusKm?: number
  zoom: number
  transmission?: Transmission
  maxPriceDaily?: number
  characteristics?: Characteristic[]
  isAccessible?: boolean
  from?: string
  to?: string
}

function buildQuery(params: MapSearchParams): string {
  const qs = new URLSearchParams()
  if (params.bounds) {
    qs.set('north', String(params.bounds.north))
    qs.set('south', String(params.bounds.south))
    qs.set('east', String(params.bounds.east))
    qs.set('west', String(params.bounds.west))
  }
  if (params.center && params.radiusKm !== undefined) {
    qs.set('lat', String(params.center.lat))
    qs.set('lng', String(params.center.lng))
    qs.set('radiusKm', String(params.radiusKm))
  }
  qs.set('zoom', String(params.zoom))
  if (params.transmission) qs.set('transmission', params.transmission)
  if (params.maxPriceDaily !== undefined)
    qs.set('maxPriceDaily', String(params.maxPriceDaily))
  if (params.characteristics && params.characteristics.length > 0)
    qs.set('characteristics', params.characteristics.join(','))
  if (params.isAccessible) qs.set('isAccessible', 'true')
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  return qs.toString()
}

export const mapaApi = {
  async searchRentadoras(params: MapSearchParams): Promise<MapSearchResponse> {
    const res = await apiClient.get<unknown>(
      `/geo/rentadoras?${buildQuery(params)}`,
    )
    return MapSearchResponseSchema.parse(res)
  },
}
