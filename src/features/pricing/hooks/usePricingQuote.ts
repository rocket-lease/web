import { useQuery } from '@tanstack/react-query'
import { pricingApi } from '@/features/pricing/api/pricing.api'
import type { PricingQuoteRequest, PricingQuoteResponse } from '@rocket-lease/contracts'

export interface UsePricingQuoteParams {
  vehicleId: string
  startAt: string | null
  endAt: string | null
  withHomeDelivery?: boolean
  withHomeReturn?: boolean
  enabled?: boolean
}

function toIsoUtc(local: string): string {
  if (!local) return ''
  const date = new Date(local)
  return date.toISOString()
}

/**
 * Cotiza el precio de una reserva potencial respetando el congelamiento del
 * `quoteToken` (5 min). El `staleTime` se setea en 4 minutos para no refetchear
 * antes de que expire el token y dejar 1 minuto de margen.
 */
export function usePricingQuote({
  vehicleId,
  startAt,
  endAt,
  withHomeDelivery,
  withHomeReturn,
  enabled = true,
}: UsePricingQuoteParams) {
  const queryKey: unknown[] = [
    'pricing',
    'quote',
    vehicleId,
    startAt,
    endAt,
    withHomeDelivery ?? false,
    withHomeReturn ?? false,
  ]

  const request: PricingQuoteRequest | null =
    startAt && endAt
      ? {
          vehicleId,
          startAt: toIsoUtc(startAt),
          endAt: toIsoUtc(endAt),
          withHomeDelivery,
          withHomeReturn,
        }
      : null

  const query = useQuery<PricingQuoteResponse>({
    queryKey,
    queryFn: () => pricingApi.quote(request as PricingQuoteRequest),
    enabled: enabled && !!request,
    staleTime: 4 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data ?? null,
    totalCents: query.data?.totalCents ?? 0,
    subtotalCents: query.data?.subtotalCents ?? 0,
    discountCents: query.data?.discountCents ?? 0,
    hasDiscount: (query.data?.discountCents ?? 0) > 0,
    pricingQuote: query.data ?? null,
  }
}
