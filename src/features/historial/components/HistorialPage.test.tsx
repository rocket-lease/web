import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReservationListItem } from '@rocket-lease/contracts'
import { HistorialPage } from './HistorialPage'
import { fetchReservations } from '@/features/reservas/api/reservations.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to: _to, ...rest }: { children: React.ReactNode; to?: string; [key: string]: unknown }) => (
    <a {...rest}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useRouter: () => ({ history: { back: vi.fn() } }),
}))

const authMock = { current: { activeRole: 'conductor' as 'conductor' | 'rentador' } }
vi.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: () => authMock.current }))

vi.mock('@/features/reservas/api/reservations.api', () => ({ fetchReservations: vi.fn() }))
vi.mock('@/features/reservar/hooks/useReReservar', () => ({ useReReservar: () => vi.fn() }))

const fetchMock = vi.mocked(fetchReservations)

function listItem(overrides: Record<string, unknown>): ReservationListItem {
  return {
    id: 'res-1',
    vehicleId: 'veh-1',
    status: 'completed',
    startAt: '2026-01-01T10:00:00.000Z',
    endAt: '2026-01-03T10:00:00.000Z',
    totalCents: 100000,
    currency: 'ARS',
    vehicle: { id: 'veh-1', plate: 'AA123BB', brand: 'Toyota', model: 'Corolla', year: 2022, photo: null },
    conductor: { id: 'c-1', name: 'Ada' },
    rentador: { id: 'r-1', name: 'Beto' },
    ...overrides,
  } as unknown as ReservationListItem
}

beforeEach(() => {
  vi.clearAllMocks()
  authMock.current = { activeRole: 'conductor' }
})

describe('HistorialPage', () => {
  it('muestra el botón Re-reservar en una reserva completada del conductor', async () => {
    fetchMock.mockResolvedValue({ items: [listItem({ status: 'completed' })], page: 1, pageSize: 10, total: 1 })

    render(<HistorialPage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('button', { name: 'Re-reservar' })).toBeInTheDocument()
  })

  it('no muestra Re-reservar en una reserva cancelada', async () => {
    fetchMock.mockResolvedValue({ items: [listItem({ status: 'cancelled' })], page: 1, pageSize: 10, total: 1 })

    render(<HistorialPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Toyota Corolla')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Re-reservar' })).not.toBeInTheDocument()
  })
})
