import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { AdminPricingZonesResponse } from '@rocket-lease/contracts'
import { useAdminPricingZones } from './useAdminPricingZones'
import { adminPricingApi } from '../api/admin-pricing.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/admin-pricing.api')

const mockApi = vi.mocked(adminPricingApi)

const RESPONSE: AdminPricingZonesResponse = {
  generatedAt: new Date().toISOString(),
  zones: [
    {
      h3Cell: '88754e6499fffff',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-58.42, -34.6],
            [-58.41, -34.6],
            [-58.41, -34.59],
            [-58.42, -34.59],
            [-58.42, -34.6],
          ],
        ],
      },
      supplyCount: 3,
      demandCount: 10,
      ratio: 3.33,
      avgMultiplier: 1.25,
      vehicleSampleIds: [],
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAdminPricingZones', () => {
  it('devuelve la respuesta del endpoint', async () => {
    mockApi.getPricingZones.mockResolvedValue(RESPONSE)
    const { result } = renderHook(() => useAdminPricingZones(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.zones).toHaveLength(1)
    expect(result.current.data?.zones[0]?.h3Cell).toBe('88754e6499fffff')
  })

  it('expone el error si la API falla', async () => {
    mockApi.getPricingZones.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAdminPricingZones(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
