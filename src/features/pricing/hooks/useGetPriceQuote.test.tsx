import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { PricingQuote } from '@rocket-lease/contracts'
import { useGetPriceQuote } from './useGetPriceQuote'
import { pricingApi } from '../api/pricing.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/pricing.api')

const mockApi = vi.mocked(pricingApi)

const VEHICLE_ID = '11111111-1111-1111-1111-111111111111'
const START = '2026-07-01T10:00:00.000Z'
const END = '2026-07-05T10:00:00.000Z'

const QUOTE: PricingQuote = {
  vehicleId: VEHICLE_ID,
  currency: 'ARS',
  basePriceCents: 10000,
  durationDays: 4,
  subtotalCents: 40000,
  appliedDiscountTier: null,
  appliedDiscountPercentage: 0,
  discountCents: 0,
  totalCents: 40000,
  multiplier: 1.0,
  quoteToken: '22222222-2222-2222-2222-222222222222',
  expiresAt: '2026-07-01T10:05:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockApi.getPriceQuote.mockResolvedValue(QUOTE)
})

describe('useGetPriceQuote', () => {
  it('no llama a la API cuando enabled=false', async () => {
    renderHook(
      () =>
        useGetPriceQuote(
          { vehicleId: VEHICLE_ID, startAt: START, endAt: END },
          { enabled: false },
        ),
      { wrapper: createWrapper() },
    )
    await new Promise((r) => setTimeout(r, 20))
    expect(mockApi.getPriceQuote).not.toHaveBeenCalled()
  })

  it('devuelve el quote cuando enabled=true', async () => {
    const { result } = renderHook(
      () => useGetPriceQuote({ vehicleId: VEHICLE_ID, startAt: START, endAt: END }),
      { wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.quoteToken).toBe(QUOTE.quoteToken)
    expect(mockApi.getPriceQuote).toHaveBeenCalledTimes(1)
  })

  it('refetchea cuando cambian los parámetros relevantes', async () => {
    const { result, rerender } = renderHook(
      (props: { withHomeDelivery: boolean }) =>
        useGetPriceQuote({
          vehicleId: VEHICLE_ID,
          startAt: START,
          endAt: END,
          withHomeDelivery: props.withHomeDelivery,
        }),
      { wrapper: createWrapper(), initialProps: { withHomeDelivery: false } },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.getPriceQuote).toHaveBeenCalledTimes(1)

    rerender({ withHomeDelivery: true })
    await waitFor(() => expect(mockApi.getPriceQuote).toHaveBeenCalledTimes(2))
    expect(mockApi.getPriceQuote.mock.calls[1]?.[0]?.withHomeDelivery).toBe(true)
  })
})
