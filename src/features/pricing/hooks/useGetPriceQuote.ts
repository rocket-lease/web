import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { pricingApi } from '@/features/pricing/api/pricing.api'
import type { PricingQuote, PricingQuoteRequest } from '@rocket-lease/contracts'

interface UseGetPriceQuoteOptions {
  enabled?: boolean
}

/**
 * Pide al backend una cotización dinámica de precio para un vehículo,
 * congelando el `quoteToken` durante 5 minutos.
 *
 * `staleTime` se setea en 4 minutos para que TanStack Query no refetchee
 * antes de que el quote expire en el backend, dejando 1 minuto de margen.
 */
export function useGetPriceQuote(
  params: PricingQuoteRequest,
  { enabled = true }: UseGetPriceQuoteOptions = {},
): UseQueryResult<PricingQuote> {
  return useQuery<PricingQuote>({
    queryKey: [
      'priceQuote',
      params.vehicleId,
      params.startAt,
      params.endAt,
      params.withHomeDelivery ?? false,
      params.withHomeReturn ?? false,
    ],
    queryFn: () => pricingApi.getPriceQuote(params),
    enabled,
    staleTime: 4 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
