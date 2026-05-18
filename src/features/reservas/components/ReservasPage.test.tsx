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
})

describe('ReservasPage — toggle de rol', () => {
  it('NO muestra el toggle "Como rentador" si el usuario no publicó vehículos', async () => {
    vehiclesMock.mockResolvedValue([])

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(vehiclesMock).toHaveBeenCalled())
    // Esperar a que la lista termine de cargar
    await screen.findByText(/Todas/i)
    expect(screen.queryByRole('tab', { name: /Como rentador/i })).toBeNull()
  })

  it('muestra el toggle si el usuario tiene vehículos publicados', async () => {
    vehiclesMock.mockResolvedValue([
      {
        id: 'v1',
        brand: 'Toyota',
        model: 'Etios',
        year: 2020,
        basePriceCents: 100000,
        currency: 'ARS' as const,
        photo: null,
      },
    ] as unknown as Awaited<ReturnType<typeof vehiclesApi.getMyVehicles>>)

    render(<ReservasPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByRole('tab', { name: /Como rentador/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Como conductor/i }),
    ).toBeInTheDocument()
  })
})

describe('ReservasPage — fetch con role', () => {
  it('llama al endpoint con role=conductor por defecto', async () => {
    vehiclesMock.mockResolvedValue([])

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'conductor' }),
    )
  })

  it('llama al endpoint con role=owner cuando ?role=owner y el user tiene vehículos', async () => {
    searchMock.current = { role: 'owner' }
    vehiclesMock.mockResolvedValue([
      {
        id: 'v1',
        brand: 'Toyota',
        model: 'Etios',
        year: 2020,
        basePriceCents: 100000,
        currency: 'ARS' as const,
        photo: null,
      },
    ] as unknown as Awaited<ReturnType<typeof vehiclesApi.getMyVehicles>>)

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'owner' }),
      ),
    )
  })

  it('fuerza role=conductor cuando ?role=owner pero el user no tiene vehículos', async () => {
    searchMock.current = { role: 'owner' }
    vehiclesMock.mockResolvedValue([])

    render(<ReservasPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'conductor' }),
    )
  })
})
