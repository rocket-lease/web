import type { Characteristic, GetVehicleResponse } from '@rocket-lease/contracts'

export interface VehiculoFilters {
  query?: string
  transmission?: GetVehicleResponse['transmission'] | null
  minPrice?: number | null
  maxPrice?: number | null
  maxPriceDaily?: number | null
  minSeats?: number | null
  minYear?: number | null
  maxYear?: number | null
  accessibility?: string[]
  characteristics?: Characteristic[]
  fechaDesde?: string
  fechaHasta?: string
}

export type SortCriteria = 'price_asc' | 'price_desc' | 'rating'
