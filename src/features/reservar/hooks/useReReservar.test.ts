import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReReservar } from './useReReservar'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'

const navigateMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

const toastInfoMock = vi.fn()
vi.mock('sonner', () => ({
  toast: { info: (...args: unknown[]) => toastInfoMock(...args) },
}))

vi.mock('@/features/vehiculos/api/vehiculos.api', () => ({
  vehiclesApi: {
    getById: vi.fn(),
  },
}))

const getByIdMock = vi.mocked(vehiclesApi.getById)

function vehicleFixture(overrides: Partial<{ enabled: boolean; city: string }> = {}) {
  return {
    id: 'veh-1',
    enabled: true,
    city: 'CABA',
    ...overrides,
  } as unknown as Awaited<ReturnType<typeof vehiclesApi.getById>>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useReReservar', () => {
  it('navega al formulario con reuse cuando el vehículo está habilitado', async () => {
    getByIdMock.mockResolvedValue(vehicleFixture({ enabled: true }))
    const { result } = renderHook(() => useReReservar())

    await result.current({ reservationId: 'res-1', vehicleId: 'veh-1' })

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/vehiculos/$id/reservar',
      params: { id: 'veh-1' },
      search: { reuse: 'res-1' },
    })
    expect(toastInfoMock).not.toHaveBeenCalled()
  })

  it('redirige al buscador y NO al formulario cuando el vehículo está deshabilitado', async () => {
    getByIdMock.mockResolvedValue(vehicleFixture({ enabled: false, city: 'Rosario' }))
    const { result } = renderHook(() => useReReservar())

    await result.current({ reservationId: 'res-1', vehicleId: 'veh-1' })

    expect(toastInfoMock).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/buscar',
      search: { city: 'Rosario', locationCode: undefined, searched: true },
    })
  })

  it('redirige al buscador cuando getById rechaza (404 = eliminado)', async () => {
    getByIdMock.mockRejectedValue(new Error('not found'))
    const { result } = renderHook(() => useReReservar())

    await result.current({
      reservationId: 'res-1',
      vehicleId: 'veh-1',
      city: 'Córdoba',
    })

    expect(toastInfoMock).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/buscar',
      search: { city: 'Córdoba', locationCode: undefined, searched: true },
    })
  })
})
