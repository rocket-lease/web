import { useQuery } from '@tanstack/react-query'
import { pricingApi } from '@/features/pricing/api/pricing.api'
import type { PricingQuoteRequest, PricingQuoteResponse } from '@rocket-lease/contracts'

export interface UsePricingQuoteParams {
  vehicleId: string
  startAt: string | null
  endAt: string | null
  enabled?: boolean
}

function toIsoUtc(local: string): string {
  if (!local) return ''
  const date = new Date(local)
  return date.toISOString()
}

export function usePricingQuote({ vehicleId, startAt, endAt, enabled = true }: UsePricingQuoteParams) {
  const queryKey: unknown[] = ['pricing', 'quote', vehicleId, startAt, endAt]

  const request: PricingQuoteRequest | null =
    startAt && endAt
      ? {
          vehicleId,
          startAt: toIsoUtc(startAt),
          endAt: toIsoUtc(endAt),
        }
      : null

  const query = useQuery<PricingQuoteResponse>({
    queryKey,
    queryFn: () => pricingApi.quote(request!),
    enabled: enabled && !!request,
    staleTime: 0,
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
