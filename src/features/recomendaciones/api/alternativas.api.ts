import { httpClient } from '@/lib/http-client'
import type { SearchAlternativesResponse } from '@rocket-lease/contracts'

export interface AlternativeSearchParams {
  brand?: string
  model?: string
  year?: number
  transmission?: string
  maxPriceCents?: number
  city?: string
  province?: string
  characteristics?: string[]
}

function buildQuery(params: AlternativeSearchParams): string {
  const searchParams = new URLSearchParams()
  if (params.brand) searchParams.set('brand', params.brand)
  if (params.model) searchParams.set('model', params.model)
  if (params.year != null) searchParams.set('year', String(params.year))
  if (params.transmission) searchParams.set('transmission', params.transmission)
  if (params.maxPriceCents != null) searchParams.set('maxPrice', String(params.maxPriceCents))
  if (params.city) searchParams.set('city', params.city)
  if (params.province) searchParams.set('province', params.province)
  if (params.characteristics?.length) searchParams.set('characteristics', params.characteristics.join(','))
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const alternativasApi = {
  async getSearchAlternatives(params: AlternativeSearchParams): Promise<SearchAlternativesResponse> {
    return httpClient.get<SearchAlternativesResponse>(`/search/alternatives${buildQuery(params)}`)
  },
}
