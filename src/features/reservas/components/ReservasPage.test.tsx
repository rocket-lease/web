import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
  },
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
