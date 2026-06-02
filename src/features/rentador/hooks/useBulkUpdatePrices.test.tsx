import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { BulkPriceUpdateRequest, BulkPriceUpdateResponse } from '@rocket-lease/contracts'
import { useBulkUpdatePrices } from './useBulkUpdatePrices'
import * as vehiclesApiModule from '@/features/vehiculos/api/vehiculos.api'

vi.mock('@/features/vehiculos/api/vehiculos.api')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useBulkUpdatePrices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a vehiclesApi.bulkUpdatePrices con la request', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockVehiclesApi = vi.mocked(vehiclesApiModule.vehiclesApi)

    const mockResponse: BulkPriceUpdateResponse = {
      updated: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          previousPriceCents: 10000,
          newPriceCents: 12000,
        },
      ],
    }

    mockVehiclesApi.bulkUpdatePrices.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBulkUpdatePrices(), { wrapper })

    const request: BulkPriceUpdateRequest = {
      vehicleIds: ['123e4567-e89b-12d3-a456-426614174000'],
      operation: { type: 'SET', valueCents: 12000 },
    }

    await act(async () => {
      result.current.mutate(request)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockVehiclesApi.bulkUpdatePrices).toHaveBeenCalledWith(request)
    expect(mockVehiclesApi.bulkUpdatePrices).toHaveBeenCalledTimes(1)
  })

  it('invalida la query ["vehicles", "mine"] al success', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockVehiclesApi = vi.mocked(vehiclesApiModule.vehiclesApi)

    const mockResponse: BulkPriceUpdateResponse = {
      updated: [],
    }

    mockVehiclesApi.bulkUpdatePrices.mockResolvedValue(mockResponse)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useBulkUpdatePrices(), { wrapper })

    const request: BulkPriceUpdateRequest = {
      vehicleIds: ['123e4567-e89b-12d3-a456-426614174001'],
      operation: { type: 'PERCENTAGE', delta: 10 },
    }

    await act(async () => {
      await result.current.mutateAsync(request)
    })

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled())

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['vehicles', 'mine'] })
  })

  it('expone el error cuando la API falla', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockVehiclesApi = vi.mocked(vehiclesApiModule.vehiclesApi)

    const mockError = new Error('API Error')
    mockVehiclesApi.bulkUpdatePrices.mockRejectedValue(mockError)

    const { result } = renderHook(() => useBulkUpdatePrices(), { wrapper })

    const request: BulkPriceUpdateRequest = {
      vehicleIds: ['123e4567-e89b-12d3-a456-426614174002'],
      operation: { type: 'SET', valueCents: 15000 },
    }

    await act(async () => {
      result.current.mutate(request)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})
