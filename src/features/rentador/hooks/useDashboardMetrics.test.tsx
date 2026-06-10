import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DashboardSummaryResponse } from '@rocket-lease/contracts'
import { useDashboardMetrics } from './useDashboardMetrics'
import { useVehicleMetrics } from './useVehicleMetrics'
import * as dashboardApiModule from '../api/dashboard.api'

vi.mock('../api/dashboard.api')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return wrapper
}

const summary: DashboardSummaryResponse = {
  period: 'month',
  range: {
    startAt: '2026-05-05T00:00:00.000Z',
    endAt: '2026-06-04T00:00:00.000Z',
  },
  totalVehicles: 2,
  activeReservations: 1,
  monthlyRevenueCents: 500000,
  fleetOccupancyRatePercent: 40,
  cancellationRatePercent: 10,
  reputationScore: 4.6,
  revenueByDay: [{ date: '2026-05-05', totalCents: 500000 }],
  vehicles: [],
  topVehicles: [],
  attentionVehicles: [],
}

describe('useDashboardMetrics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pide las métricas del período seleccionado', async () => {
    const api = vi.mocked(dashboardApiModule.dashboardApi)
    api.getMetrics.mockResolvedValue(summary)

    const { result } = renderHook(() => useDashboardMetrics('quarter'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.getMetrics).toHaveBeenCalledWith({
      period: 'quarter',
      from: undefined,
      to: undefined,
    })
    expect(result.current.data?.monthlyRevenueCents).toBe(500000)
  })
})

describe('useVehicleMetrics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no dispara la query si no hay vehicleId', async () => {
    const api = vi.mocked(dashboardApiModule.dashboardApi)
    const { result } = renderHook(() => useVehicleMetrics('', 'month'), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(api.getVehicleMetrics).not.toHaveBeenCalled()
  })

  it('pide el detalle con vehicleId y período', async () => {
    const api = vi.mocked(dashboardApiModule.dashboardApi)
    api.getVehicleMetrics.mockResolvedValue({
      period: 'week',
      range: summary.range,
      vehicle: {
        vehicleId: '018f8b3c-4d0e-7000-8000-000000000001',
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'ABC123',
        photoUrl: null,
        occupancyRatePercent: 20,
        occupiedRanges: [],
        revenueCents: 100000,
        reservationCount: 1,
        cancellationRatePercent: 0,
        lowOccupancy: true,
      },
      revenueByDay: [{ date: '2026-05-05', totalCents: 100000 }],
      reservationCount: 1,
      cancelledCount: 0,
    })

    const { result } = renderHook(
      () => useVehicleMetrics('018f8b3c-4d0e-7000-8000-000000000001', 'week'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.getVehicleMetrics).toHaveBeenCalledWith(
      '018f8b3c-4d0e-7000-8000-000000000001',
      { period: 'week', from: undefined, to: undefined },
    )
    expect(result.current.data?.cancelledCount).toBe(0)
  })
})
