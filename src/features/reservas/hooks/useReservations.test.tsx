import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReservations } from './useReservations'
import * as reservationsApi from '../api/reservations.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/reservations.api')

const mockFetchReservations = vi.mocked(reservationsApi.fetchReservations)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useReservations', () => {
  it('llama a fetchReservations con los filtros y retorna los datos', async () => {
    mockFetchReservations.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    })

    const filters = { role: 'conductor', page: 1, pageSize: 10 } as any
    const { result } = renderHook(() => useReservations(filters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFetchReservations).toHaveBeenCalledWith(filters)
  })

  it('no llama a la API cuando enabled=false', async () => {
    mockFetchReservations.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    })

    const filters = { role: 'conductor', page: 1, pageSize: 10 } as any
    const { result } = renderHook(
      () => useReservations(filters, { enabled: false }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetchReservations).not.toHaveBeenCalled()
  })

  it('retorna los items que responde la API', async () => {
    const mockItem = {
      id: 'r-1',
      vehicleId: 'v-1',
      conductorId: 'c-1',
      rentadorId: 'o-1',
      status: 'active',
      startAt: '2026-06-01T10:00:00Z',
      endAt: '2026-06-02T10:00:00Z',
      holdExpiresAt: null,
      totalCents: 10000,
      currency: 'ARS',
      paymentMethod: null,
      paidAt: null,
      rejectionReason: null,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      vehicle: {} as any,
      conductor: {} as any,
      rentador: {} as any,
    } as any

    mockFetchReservations.mockResolvedValue({
      items: [mockItem],
      total: 1,
      page: 1,
      pageSize: 10,
    })

    const filters = { role: 'conductor', page: 1, pageSize: 10 } as any
    const { result } = renderHook(() => useReservations(filters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0].id).toBe('r-1')
  })
})
