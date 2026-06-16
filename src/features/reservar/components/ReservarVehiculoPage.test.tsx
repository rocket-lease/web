import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ReservarVehiculoPage } from './ReservarVehiculoPage'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { reservarApi } from '../api/reservar.api'
import { createWrapper } from '@/test/query-wrapper'

const searchMock = { current: {} as Record<string, unknown> }

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: 'veh-1' }),
  useSearch: () => searchMock.current,
  useNavigate: () => vi.fn(),
  useRouter: () => ({ history: { back: vi.fn() } }),
}))

vi.mock('@/features/vehiculos/api/vehiculos.api', () => ({
  vehiclesApi: { getById: vi.fn() },
}))

vi.mock('../api/reservar.api', () => ({
  reservarApi: { getById: vi.fn(), getBusyRanges: vi.fn() },
}))

vi.mock('./AddressAutocomplete', () => ({
  AddressAutocomplete: ({ value }: { value: { formattedAddress?: string } | null }) => (
    <div data-testid="address-autocomplete">{value?.formattedAddress ?? 'sin-direccion'}</div>
  ),
}))

const getVehicleMock = vi.mocked(vehiclesApi.getById)
const getReservationMock = vi.mocked(reservarApi.getById)
const getBusyRangesMock = vi.mocked(reservarApi.getBusyRanges)

function vehicleFixture() {
  return {
    id: 'veh-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    plate: 'AA123BB',
    city: 'CABA',
    address: 'Av. Siempreviva 742',
    enabled: true,
    homeDeliveryEnabled: true,
    homeDeliveryFeeCents: 5000,
    homeReturnEnabled: true,
    homeReturnFeeCents: 5000,
    reservationRuleSet: null,
  } as unknown as Awaited<ReturnType<typeof vehiclesApi.getById>>
}

function reservationFixture() {
  return {
    id: 'res-1',
    withHomeDelivery: true,
    deliveryAddress: { formattedAddress: 'Calle Falsa 123', latitude: -34.6, longitude: -58.4 },
    withHomeReturn: false,
    returnAddress: null,
  } as unknown as Awaited<ReturnType<typeof reservarApi.getById>>
}

beforeEach(() => {
  vi.clearAllMocks()
  searchMock.current = {}
  getVehicleMock.mockResolvedValue(vehicleFixture())
  getBusyRangesMock.mockResolvedValue({ items: [] } as unknown as Awaited<
    ReturnType<typeof reservarApi.getBusyRanges>
  >)
  getReservationMock.mockResolvedValue(reservationFixture())
})

describe('ReservarVehiculoPage — re-reserva (US-31)', () => {
  it('precarga la dirección de entrega de la reserva anterior cuando hay ?reuse', async () => {
    searchMock.current = { reuse: 'res-1' }

    render(<ReservarVehiculoPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(getReservationMock).toHaveBeenCalledWith('res-1'))
    expect(await screen.findByText('Calle Falsa 123')).toBeInTheDocument()
  })

  it('no consulta la reserva anterior ni precarga direcciones sin ?reuse', async () => {
    searchMock.current = {}

    render(<ReservarVehiculoPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(getVehicleMock).toHaveBeenCalled())
    expect(getReservationMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Calle Falsa 123')).not.toBeInTheDocument()
  })
})
