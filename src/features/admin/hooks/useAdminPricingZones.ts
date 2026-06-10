import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { adminPricingApi } from '@/features/admin/api/admin-pricing.api'
import type { AdminPricingZonesResponse } from '@rocket-lease/contracts'

/**
 * Trae el snapshot de zonas H3 con oferta, demanda y multiplier promedio.
 * Refetchea cada 60 segundos para mantener el mapa del admin razonablemente
 * vivo sin saturar el endpoint.
 */
export function useAdminPricingZones(): UseQueryResult<AdminPricingZonesResponse> {
  return useQuery<AdminPricingZonesResponse>({
    queryKey: ['admin', 'pricing', 'zones'],
    queryFn: adminPricingApi.getPricingZones,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  })
}
