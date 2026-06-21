import { useQuery } from '@tanstack/react-query'
import { recomendacionesApi } from '../api/recomendaciones.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { RecommendedVehiclesResponse } from '@rocket-lease/contracts'

export function useRecommendations() {
  const { isAuthenticated } = useAuth()
  return useQuery<RecommendedVehiclesResponse>({
    queryKey: ['recomendaciones', 'list'],
    queryFn: recomendacionesApi.getRecommendations,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — las recomendaciones no cambian tan seguido
  })
}
