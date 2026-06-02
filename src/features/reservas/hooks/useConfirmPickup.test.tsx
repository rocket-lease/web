import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as reservationsApi from '../api/reservations.api'
import { useConfirmPickup } from './useConfirmPickup'

vi.mock('../api/reservations.api')

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'
const VOUCHER_TOKEN = 'tok-abc123'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useConfirmPickup', () => {
  it('llama a confirmPickup con el voucherToken', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmPickup = vi.mocked(reservationsApi.confirmPickup)
    mockConfirmPickup.mockResolvedValue({
      reservationId: RESERVATION_ID,
      status: 'in_progress',
      startedAt: '2026-06-01T10:00:00.000Z',
      returnQrToken: 'rtok-xyz',
    })

    const { result } = renderHook(() => useConfirmPickup(RESERVATION_ID), { wrapper })

    act(() => {
      result.current.mutate(VOUCHER_TOKEN)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockConfirmPickup).toHaveBeenCalledWith(VOUCHER_TOKEN)
  })

  it('invalida las queries ["reservation", id] y ["reservations"] al success', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmPickup = vi.mocked(reservationsApi.confirmPickup)
    mockConfirmPickup.mockResolvedValue({
      reservationId: RESERVATION_ID,
      status: 'in_progress',
      startedAt: '2026-06-01T10:00:00.000Z',
      returnQrToken: 'rtok-xyz',
    })

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useConfirmPickup(RESERVATION_ID), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(VOUCHER_TOKEN)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['reservation', RESERVATION_ID] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['reservations'] })
  })

  it('expone el error cuando la API falla', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmPickup = vi.mocked(reservationsApi.confirmPickup)
    mockConfirmPickup.mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useConfirmPickup(RESERVATION_ID), { wrapper })

    act(() => {
      result.current.mutate(VOUCHER_TOKEN)
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
