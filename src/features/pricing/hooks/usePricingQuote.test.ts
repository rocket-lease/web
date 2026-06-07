vi.mock('@/features/pricing/api/pricing.api', () => ({
  pricingApi: {
    quote: vi.fn(),
  },
}))

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { pricingApi } from '@/features/pricing/api/pricing.api'
import { usePricingQuote } from './usePricingQuote'
import { createWrapper } from '@/test/query-wrapper'

const mockQuote = vi.mocked(pricingApi.quote)

const VEHICLE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const START_AT = '2026-06-10'
const END_AT = '2026-06-13'

const MOCK_QUOTE_RESPONSE = {
  vehicleId: VEHICLE_ID,
  currency: 'ARS',
  basePriceCents: 10000,
  durationDays: 3,
  subtotalCents: 30000,
  appliedDiscountTier: null,
  appliedDiscountPercentage: 0,
  discountCents: 0,
  totalCents: 30000,
  multiplier: 1.0,
  deliveryFeeCents: 0,
  quoteToken: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  expiresAt: '2026-06-10T17:05:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usePricingQuote', () => {
  it('no llama al api si startAt es null', async () => {
    const wrapper = createWrapper()
    renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: null, endAt: END_AT }),
      { wrapper },
    )
    await new Promise<void>(r => setTimeout(r, 50))
    expect(mockQuote).not.toHaveBeenCalled()
  })

  it('no llama al api si endAt es null', async () => {
    const wrapper = createWrapper()
    renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: null }),
      { wrapper },
    )
    await new Promise<void>(r => setTimeout(r, 50))
    expect(mockQuote).not.toHaveBeenCalled()
  })

  it('no llama al api si enabled es false con fechas válidas', async () => {
    const wrapper = createWrapper()
    renderHook(
      () =>
        usePricingQuote({
          vehicleId: VEHICLE_ID,
          startAt: START_AT,
          endAt: END_AT,
          enabled: false,
        }),
      { wrapper },
    )
    await new Promise<void>(r => setTimeout(r, 50))
    expect(mockQuote).not.toHaveBeenCalled()
  })

  it('llama a pricingApi.quote con vehicleId y fechas en formato ISO UTC', async () => {
    mockQuote.mockResolvedValue(MOCK_QUOTE_RESPONSE)
    const wrapper = createWrapper()
    renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: END_AT }),
      { wrapper },
    )
    await waitFor(() => expect(mockQuote).toHaveBeenCalledOnce())
    expect(mockQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleId: VEHICLE_ID,
        startAt: expect.stringMatching(/T.*Z$/),
        endAt: expect.stringMatching(/T.*Z$/),
      }),
    )
  })

  it('expone totalCents, subtotalCents, discountCents y hasDiscount cuando hay datos', async () => {
    mockQuote.mockResolvedValue(MOCK_QUOTE_RESPONSE)
    const wrapper = createWrapper()
    const { result } = renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: END_AT }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.totalCents).toBe(30000)
    expect(result.current.subtotalCents).toBe(30000)
    expect(result.current.discountCents).toBe(0)
    expect(result.current.hasDiscount).toBe(false)
    expect(result.current.pricingQuote).toEqual(MOCK_QUOTE_RESPONSE)
  })

  it('hasDiscount es true y discountCents refleja el descuento aplicado', async () => {
    mockQuote.mockResolvedValue({
      ...MOCK_QUOTE_RESPONSE,
      discountCents: 3000,
      totalCents: 27000,
    })
    const wrapper = createWrapper()
    const { result } = renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: END_AT }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasDiscount).toBe(true)
    expect(result.current.discountCents).toBe(3000)
  })

  it('devuelve defaults (totalCents=0, pricingQuote=null) antes de que la query resuelva', () => {
    mockQuote.mockImplementation(() => new Promise(() => {}))
    const wrapper = createWrapper()
    const { result } = renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: END_AT }),
      { wrapper },
    )
    expect(result.current.totalCents).toBe(0)
    expect(result.current.subtotalCents).toBe(0)
    expect(result.current.discountCents).toBe(0)
    expect(result.current.hasDiscount).toBe(false)
    expect(result.current.pricingQuote).toBeNull()
  })

  it('pasa withHomeDelivery=true en el request cuando se indica', async () => {
    mockQuote.mockResolvedValue(MOCK_QUOTE_RESPONSE)
    const wrapper = createWrapper()
    renderHook(
      () =>
        usePricingQuote({
          vehicleId: VEHICLE_ID,
          startAt: START_AT,
          endAt: END_AT,
          withHomeDelivery: true,
        }),
      { wrapper },
    )
    await waitFor(() => expect(mockQuote).toHaveBeenCalledOnce())
    expect(mockQuote).toHaveBeenCalledWith(
      expect.objectContaining({ withHomeDelivery: true }),
    )
  })

  it('expone isError=true cuando la API falla', async () => {
    mockQuote.mockRejectedValue(new Error('network'))
    const wrapper = createWrapper()
    const { result } = renderHook(
      () => usePricingQuote({ vehicleId: VEHICLE_ID, startAt: START_AT, endAt: END_AT }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
