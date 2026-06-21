import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReservationListItem } from '@rocket-lease/contracts'
import { ReservasPage } from './ReservasPage'
import { fetchReservations } from '../api/reservations.api'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { createWrapper } from '@/test/query-wrapper'

const navigateMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to: _to,
    search: _search,
    ...rest
  }: {
    children: React.ReactNode
    to?: string
    search?: unknown
    [key: string]: unknown
  }) => <a {...rest}>{children}</a>,
  useNavigate: () => navigateMock,
  useRouter: () => ({ history: { back: vi.fn() } }),
}))

const authMock = {
  current: { activeRole: 'conductor' as 'conductor' | 'rentador' },
}

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => authMock.current,
}))

vi.mock('../api/reservations.api', () => ({
  fetchReservations: vi.fn(),
}))

vi.mock('@/features/vehiculos/api/vehiculos.api', () => ({
  vehiclesApi: {
    getMyVehicles: vi.fn(),
    getById: vi.fn(),
  },
}))

vi.mock('@/features/chat/hooks/useUnreadCount', () => ({
  useUnreadCount: () => ({ data: 0 }),
}))

const fetchMock = vi.mocked(fetchReservations)
const vehiclesMock = vi.mocked(vehiclesApi.getMyVehicles)

function emptyListResponse() {
  return { items: [], page: 1, pageSize: 20, total: 0 }
}

beforeEach(() => {
  vi.clearAllMocks()
  authMock.current = { activeRole: 'conductor' }
  fetchMock.mockResolvedValue(emptyListResponse())
  vehiclesMock.mockResolvedValue([])
})

describe('ReservasPage — fetch según activeRole', () => {
  it('no dispara getMyVehicles en el render inicial como conductor', async () => {
    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(vehiclesMock).not.toHaveBeenCalled()
  })

  it('llama al endpoint con role=conductor cuando activeRole es conductor', async () => {
    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'conductor' }),
    )
  })

  it('llama al endpoint con role=owner cuando activeRole es rentador', async () => {
    authMock.current = { activeRole: 'rentador' }

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'owner' }),
      ),
    )
  })
})

describe('ReservasPage — empty state', () => {
  it('dispara getMyVehicles cuando el lado owner está vacío para diferenciar la copy', async () => {
    authMock.current = { activeRole: 'rentador' }
    vehiclesMock.mockResolvedValue([])
    fetchMock.mockResolvedValue(emptyListResponse())

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(vehiclesMock).toHaveBeenCalled())
    expect(
      await screen.findByText(/Publicá un vehículo/i),
    ).toBeInTheDocument()
  })
})

function listItem(overrides: Record<string, unknown>): ReservationListItem {
  return {
    id: 'res-1',
    vehicleId: 'veh-1',
    conductorId: 'c-1',
    rentadorId: 'r-1',
    status: 'completed',
    startAt: '2026-01-01T10:00:00.000Z',
    endAt: '2026-01-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS',
    paymentMethod: 'card',
    paidAt: '2026-01-01T10:00:00.000Z',
    rejectionReason: null,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    vehicle: { id: 'veh-1', plate: 'AA123BB', brand: 'Toyota', model: 'Corolla', year: 2022, photo: null },
    conductor: { id: 'c-1', name: 'Ada' },
    rentador: { id: 'r-1', name: 'Beto' },
    ...overrides,
  } as unknown as ReservationListItem
}

function listResponse(items: ReservationListItem[]) {
  return { items, page: 1, pageSize: 20, total: items.length }
}

describe('ReservasPage — botón Re-reservar (US-31)', () => {
  it('no muestra el botón Re-reservar entre las reservas activas (el re-reservar vive en Historial)', async () => {
    fetchMock.mockResolvedValue(listResponse([listItem({ status: 'confirmed' })]))

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Toyota Corolla')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Re-reservar' })).not.toBeInTheDocument()
  })
})
