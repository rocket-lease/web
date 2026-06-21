import { useQuery } from '@tanstack/react-query'
import { alternativasApi, type AlternativeSearchParams } from '../api/alternativas.api'
import type { SearchAlternativesResponse } from '@rocket-lease/contracts'

export function useSearchAlternatives(params: AlternativeSearchParams) {
  const hasFilters = Object.values(params).some((v) => v != null && v !== '')
  return useQuery<SearchAlternativesResponse>({
    queryKey: ['recomendaciones', 'alternatives', params],
    queryFn: () => alternativasApi.getSearchAlternatives(params),
    enabled: hasFilters,
    staleTime: 5 * 60 * 1000,
  })
}
