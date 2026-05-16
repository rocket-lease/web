import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOwnerReservations } from './useOwnerReservations'
import * as api from '../api/owner-reservations.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/owner-reservations.api')

const fetchSpy = vi.mocked(api.fetchOwnerReservations)

const RENT_ID = '11111111-1111-1111-1111-111111111111'
const CON_ID = '22222222-2222-2222-2222-222222222222'
const VEH_ID = '33333333-3333-3333-3333-333333333333'
const RES_ID = '44444444-4444-4444-4444-444444444444'

function makeReservation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: RES_ID,
    vehicleId: VEH_ID,
    conductorId: CON_ID,
    rentadorId: RENT_ID,
    status: 'confirmed',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS',
    paymentMethod: 'credit_card',
    paidAt: '2026-05-15T10:00:00.000Z',
    createdAt: '2026-05-15T10:00:00.000Z',
    updatedAt: '2026-05-15T10:00:00.000Z',
    vehicle: { id: VEH_ID, brand: 'Toyota', model: 'Etios', year: 2020, photo: null },
    conductor: { id: CON_ID, name: 'Julian', avatarUrl: null },
    rentador: { id: RENT_ID, name: 'Lucas', avatarUrl: null },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useOwnerReservations', () => {
  it('devuelve items y total cuando la API responde OK', async () => {
    fetchSpy.mockResolvedValue({
      items: [makeReservation()],
      page: 1,
      pageSize: 20,
      total: 1,
    } as never)

    const { result } = renderHook(
      () => useOwnerReservations({ page: 1, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.total).toBe(1)
  })

  it('propaga los filtros (status, from, to) en la llamada', async () => {
    fetchSpy.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })

    const { result } = renderHook(
      () =>
        useOwnerReservations({
          status: ['confirmed'],
          from: '2026-05-01T00:00:00.000Z',
          to: '2026-05-31T23:59:59.000Z',
          page: 1,
          pageSize: 20,
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['confirmed'],
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-31T23:59:59.000Z',
      }),
    )
  })

  it('no llama a la API cuando enabled=false', async () => {
    fetchSpy.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })

    renderHook(
      () => useOwnerReservations({ page: 1, pageSize: 20 }, { enabled: false }),
      { wrapper: createWrapper() },
    )

    // Esperar un tick para asegurar que no hace fetch
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
