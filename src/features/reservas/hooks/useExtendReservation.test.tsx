import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useExtendReservation } from './useExtendReservation'
import * as reservationsApi from '../api/reservations.api'

vi.mock('../api/reservations.api')

const mockedExtend = vi.mocked(reservationsApi.extendReservation)

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'
const PARENT_ID = '22222222-2222-2222-2222-222222222222'
const NEW_END_AT = '2026-06-15T18:00:00.000Z'
const HOLD = '2026-06-01T12:10:00.000Z'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useExtendReservation', () => {
  it('llama a extendReservation con id + newEndAt y devuelve la respuesta', async () => {
    mockedExtend.mockResolvedValue({
      id: 'new-id',
      parentReservationId: PARENT_ID,
      status: 'pending_payment',
      holdExpiresAt: HOLD,
      totalCents: 50000,
      currency: 'ARS',
      pricingSnapshot: {
        vehicleId: '33333333-3333-3333-3333-333333333333',
        currency: 'ARS',
        basePriceCents: 10000,
        durationDays: 5,
        subtotalCents: 50000,
        appliedDiscountTier: null,
        appliedDiscountPercentage: 0,
        discountCents: 0,
        totalCents: 50000,
      },
      requiresApproval: false,
      pricingSnapshot: { vehicleId: PARENT_ID, currency: 'ARS' as const, basePriceCents: 25000, durationDays: 2, subtotalCents: 50000, appliedDiscountTier: null, appliedDiscountPercentage: 0, discountCents: 0, totalCents: 50000 },
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useExtendReservation(), { wrapper })

    act(() => {
      result.current.mutate({
        reservationId: RESERVATION_ID,
        newEndAt: NEW_END_AT,
      })
    })

    await waitFor(() =>
      expect(mockedExtend).toHaveBeenCalledWith(RESERVATION_ID, NEW_END_AT),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.requiresApproval).toBe(false)
  })

  it('invalida queries de reservations, reservationsCount y detalle al success', async () => {
    mockedExtend.mockResolvedValue({
      id: 'new-id',
      parentReservationId: PARENT_ID,
      status: 'pending_approval',
      holdExpiresAt: HOLD,
      totalCents: 50000,
      currency: 'ARS',
      pricingSnapshot: {
        vehicleId: '33333333-3333-3333-3333-333333333333',
        currency: 'ARS',
        basePriceCents: 10000,
        durationDays: 5,
        subtotalCents: 50000,
        appliedDiscountTier: null,
        appliedDiscountPercentage: 0,
        discountCents: 0,
        totalCents: 50000,
      },
      requiresApproval: true,
      pricingSnapshot: { vehicleId: PARENT_ID, currency: 'ARS' as const, basePriceCents: 25000, durationDays: 2, subtotalCents: 50000, appliedDiscountTier: null, appliedDiscountPercentage: 0, discountCents: 0, totalCents: 50000 },
    })

    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useExtendReservation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        reservationId: RESERVATION_ID,
        newEndAt: NEW_END_AT,
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reservations'] })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['reservationsCount'],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['reservation', RESERVATION_ID],
    })
  })

  it('expone el error cuando la API falla', async () => {
    mockedExtend.mockRejectedValue({
      code: 'RESERVATION_VEHICLE_NOT_AVAILABLE',
      title: 'conflict',
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useExtendReservation(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          reservationId: RESERVATION_ID,
          newEndAt: NEW_END_AT,
        })
      } catch {
        /* expected */
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
