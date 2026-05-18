import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ReservasPage } from './ReservasPage'
import { fetchReservations } from '../api/reservations.api'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { createWrapper } from '@/test/query-wrapper'

const navigateMock = vi.fn()
const searchMock = { current: {} as { role?: 'conductor' | 'owner' } }

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
  useSearch: () => searchMock.current,
  useRouter: () => ({ history: { back: vi.fn() } }),
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
  searchMock.current = {}
  fetchMock.mockResolvedValue(emptyListResponse())
  vehiclesMock.mockResolvedValue([])
})

describe('ReservasPage — toggle de rol', () => {
  it('muestra el toggle siempre (sin esperar a getMyVehicles)', async () => {
    render(<ReservasPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByRole('tab', { name: /Como conductor/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Como rentador/i }),
    ).toBeInTheDocument()
  })

  it('no dispara getMyVehicles en el render inicial — solo cuando se necesita el empty state owner', async () => {
    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(vehiclesMock).not.toHaveBeenCalled()
  })
})

describe('ReservasPage — fetch con role', () => {
  it('llama al endpoint con role=conductor por defecto', async () => {
    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'conductor' }),
    )
  })

  it('llama al endpoint con role=owner cuando ?role=owner', async () => {
    searchMock.current = { role: 'owner' }

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
    searchMock.current = { role: 'owner' }
    vehiclesMock.mockResolvedValue([])
    fetchMock.mockResolvedValue(emptyListResponse())

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(vehiclesMock).toHaveBeenCalled())
    expect(
      await screen.findByText(/Publicá un vehículo/i),
    ).toBeInTheDocument()
  })
})
