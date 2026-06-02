import { apiClient } from '@/lib/api-client'
import {
  PricingQuoteRequestSchema,
  PricingQuoteResponseSchema,
  type PricingQuoteRequest,
  type PricingQuoteResponse,
} from '@rocket-lease/contracts'

export const pricingApi = {
  async quote(data: PricingQuoteRequest): Promise<PricingQuoteResponse> {
    const parsed = PricingQuoteRequestSchema.parse(data)
    const raw = await apiClient.post<unknown>('/pricing/quote', parsed)
    return PricingQuoteResponseSchema.parse(raw)
  },
}