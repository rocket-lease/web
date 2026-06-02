import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApproveReservation } from './useApproveReservation'
import * as reservationsApi from '../api/reservations.api'

vi.mock('../api/reservations.api')

const mockedApprove = vi.mocked(reservationsApi.approveReservation)

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'

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

describe('useApproveReservation', () => {
  it('llama a approveReservation con el reservationId y devuelve la respuesta', async () => {
    mockedApprove.mockResolvedValue({
      id: RESERVATION_ID,
      status: 'pending_payment',
      holdExpiresAt: null,
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useApproveReservation(), { wrapper })

    act(() => {
      result.current.mutate(RESERVATION_ID)
    })

    await waitFor(() => expect(mockedApprove).toHaveBeenCalledWith(RESERVATION_ID))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('invalida las queries [\'reservations\'] y [\'reservation\', id] al success', async () => {
    mockedApprove.mockResolvedValue({
      id: RESERVATION_ID,
      status: 'pending_payment',
      holdExpiresAt: null,
    })

    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useApproveReservation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(RESERVATION_ID)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reservations'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reservation', RESERVATION_ID] })
  })

  it('expone el error cuando la API falla', async () => {
    mockedApprove.mockRejectedValue({
      code: 'RESERVATION_ALREADY_APPROVED',
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useApproveReservation(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync(RESERVATION_ID)
      } catch {
        /* expected */
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
