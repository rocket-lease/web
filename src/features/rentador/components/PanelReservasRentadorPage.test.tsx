import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PanelReservasRentadorPage } from './PanelReservasRentadorPage'
import * as ownerApi from '../api/owner-reservations.api'
import * as vehiclesApiMod from '@/features/vehiculos/api/vehiculos.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/owner-reservations.api')
vi.mock('@/features/vehiculos/api/vehiculos.api')

// Stub del Link y useRouter de TanStack para que no necesite RouterProvider.
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode
    to?: string
    [key: string]: unknown
  }) => (
    <a href={typeof to === 'string' ? to : '#'} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ history: { back: vi.fn() } }),
  useParams: () => ({}),
}))

const RENT = '11111111-1111-1111-1111-111111111111'
const VEH = '22222222-2222-2222-2222-222222222222'
const CON = '33333333-3333-3333-3333-333333333333'

const fetchOwner = vi.mocked(ownerApi.fetchOwnerReservations)
const vehiclesApi = vi.mocked(vehiclesApiMod.vehiclesApi)

function makeReservation(overrides: Record<string, unknown> = {}) {
  return {
    id: '44444444-4444-4444-4444-444444444444',
    vehicleId: VEH,
    conductorId: CON,
    rentadorId: RENT,
    status: 'confirmed' as const,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS' as const,
    paymentMethod: 'credit_card' as const,
    paidAt: '2026-05-15T10:00:00.000Z',
    createdAt: '2026-05-15T10:00:00.000Z',
    updatedAt: '2026-05-15T10:00:00.000Z',
    vehicle: { id: VEH, brand: 'Toyota', model: 'Etios', year: 2020, photo: null },
    conductor: { id: CON, name: 'Julian', avatarUrl: null },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: rentador con vehículos publicados pero sin reservas.
  vehiclesApi.getMyVehicles = vi.fn().mockResolvedValue([{ id: VEH }])
})

describe('PanelReservasRentadorPage', () => {
  it('muestra las cards con datos del vehículo y del conductor', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation()],
      page: 1,
      pageSize: 20,
      total: 1,
    })

    render(<PanelReservasRentadorPage />, { wrapper: createWrapper() })

    expect(await screen.findByText(/Toyota Etios/i)).toBeInTheDocument()
    expect(screen.getByText(/Julian/)).toBeInTheDocument()
  })

  it('arranca en la tab "Todas" — la primera request no manda filtro de status', async () => {
    fetchOwner.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })

    render(<PanelReservasRentadorPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchOwner).toHaveBeenCalled())
    expect(fetchOwner.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 20 })
    expect(fetchOwner.mock.calls[0][0].status).toBeUndefined()
  })

  it('al cambiar a "Confirmadas" filtra client-side cuando todo entra en cache', async () => {
    fetchOwner.mockResolvedValue({
      items: [
        makeReservation({ id: 'r-conf', status: 'confirmed' }),
        makeReservation({ id: 'r-pend', status: 'pending_payment' }),
      ],
      page: 1,
      pageSize: 20,
      total: 2,
    })

    render(<PanelReservasRentadorPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(fetchOwner).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: /^Confirmadas$/ }))

    // Como total (2) <= pageSize (20), el cambio de tab no debe pegar otra request.
    // Esperamos un tick para asegurar que no haya un fetch en flight.
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(fetchOwner).toHaveBeenCalledTimes(1)
  })

  it('cuando 0 reservas y 0 vehículos publicados, muestra empty diferenciado', async () => {
    fetchOwner.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })
    vehiclesApi.getMyVehicles = vi.fn().mockResolvedValue([])

    render(<PanelReservasRentadorPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Publica un vehiculo para empezar a recibir reservas/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Publicar vehículo/i }),
    ).toBeInTheDocument()
  })

  it('cuando 0 reservas pero sí tiene vehículos, muestra "no hay reservas todavía"', async () => {
    fetchOwner.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0 })

    render(<PanelReservasRentadorPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/No tenes reservas en esta categoria todavia/i),
    ).toBeInTheDocument()
  })
})
