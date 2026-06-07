import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { AdminPricingZonesResponse } from '@rocket-lease/contracts'
import { AdminPricingPage } from './AdminPricingPage'
import { adminPricingApi } from '../api/admin-pricing.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/admin-pricing.api')
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Map: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-map">{children}</div>
  ),
  useMap: () => null,
}))

const mockApi = vi.mocked(adminPricingApi)

const EMPTY: AdminPricingZonesResponse = {
  generatedAt: new Date().toISOString(),
  zones: [],
}

const WITH_ZONES: AdminPricingZonesResponse = {
  generatedAt: new Date().toISOString(),
  zones: [
    {
      h3Cell: '88754e6499fffff',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-58.42, -34.6],
            [-58.41, -34.6],
            [-58.41, -34.59],
            [-58.42, -34.59],
            [-58.42, -34.6],
          ],
        ],
      },
      supplyCount: 3,
      demandCount: 10,
      ratio: 3.33,
      avgMultiplier: 1.25,
      vehicleSampleIds: [],
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminPricingPage', () => {
  it('muestra estado de carga mientras pide las zonas', () => {
    mockApi.getPricingZones.mockImplementation(() => new Promise(() => {}))
    render(<AdminPricingPage />, { wrapper: createWrapper() })
    expect(screen.getByText(/cargando zonas/i)).toBeInTheDocument()
  })

  it('muestra hint cuando no hay zonas', async () => {
    mockApi.getPricingZones.mockResolvedValue(EMPTY)
    render(<AdminPricingPage />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByTestId('mock-map')).toBeInTheDocument())
    expect(screen.getByText(/no hay actividad/i)).toBeInTheDocument()
  })

  it('rendera el mapa cuando hay zonas', async () => {
    mockApi.getPricingZones.mockResolvedValue(WITH_ZONES)
    render(<AdminPricingPage />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByTestId('mock-map')).toBeInTheDocument())
    expect(screen.queryByText(/no hay actividad/i)).not.toBeInTheDocument()
  })

  it('muestra estado de error si falla la carga', async () => {
    mockApi.getPricingZones.mockRejectedValue(new Error('boom'))
    render(<AdminPricingPage />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText(/no pudimos cargar las zonas/i)).toBeInTheDocument())
  })
})
