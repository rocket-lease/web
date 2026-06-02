import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as reservationsApi from '../api/reservations.api'
import { useConfirmReturn } from './useConfirmReturn'

vi.mock('../api/reservations.api')

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'
const RETURN_QR_TOKEN = 'rtok-xyz789'

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

describe('useConfirmReturn', () => {
  it('llama a confirmReturn con el returnQrToken', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmReturn = vi.mocked(reservationsApi.confirmReturn)
    mockConfirmReturn.mockResolvedValue({
      reservationId: RESERVATION_ID,
      status: 'completed',
      completedAt: '2026-06-04T10:00:00.000Z',
    })

    const { result } = renderHook(() => useConfirmReturn(RESERVATION_ID), { wrapper })

    act(() => {
      result.current.mutate(RETURN_QR_TOKEN)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockConfirmReturn).toHaveBeenCalledWith(RETURN_QR_TOKEN)
  })

  it('invalida las queries ["reservation", id] y ["reservations"] al success', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmReturn = vi.mocked(reservationsApi.confirmReturn)
    mockConfirmReturn.mockResolvedValue({
      reservationId: RESERVATION_ID,
      status: 'completed',
      completedAt: '2026-06-04T10:00:00.000Z',
    })

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useConfirmReturn(RESERVATION_ID), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(RETURN_QR_TOKEN)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['reservation', RESERVATION_ID] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['reservations'] })
  })

  it('expone el error cuando la API falla', async () => {
    const { queryClient, wrapper } = createWrapper()
    const mockConfirmReturn = vi.mocked(reservationsApi.confirmReturn)
    mockConfirmReturn.mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useConfirmReturn(RESERVATION_ID), { wrapper })

    act(() => {
      result.current.mutate(RETURN_QR_TOKEN)
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
