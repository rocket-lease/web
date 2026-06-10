import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PricingHexMap } from './PricingHexMap'

vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Map: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-map">{children}</div>
  ),
  AdvancedMarker: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useMap: () => null,
}))

// El render del mapa depende de la API key (env). En CI no está, así que la
// forzamos acá para testear el componente, no la presencia de la key.
vi.mock('@/lib/maps', async (importActual) => ({
  ...(await importActual<typeof import('@/lib/maps')>()),
  GOOGLE_MAPS_API_KEY: 'test-key',
}))

describe('PricingHexMap', () => {
  it('renderea sin crashear con la lista de zonas vacía', () => {
    const { getByTestId } = render(
      <PricingHexMap
        zones={[]}
        selectedH3Cell={null}
        onHexClick={() => {}}
        onMapClick={() => {}}
      />,
    )
    expect(getByTestId('mock-map')).toBeInTheDocument()
  })

  it('renderea con zonas con geometría', () => {
    const { getByTestId } = render(
      <PricingHexMap
        onMapClick={() => {}}
        zones={[
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
            supplyCount: 1,
            demandCount: 2,
            ratio: 2,
            avgMultiplier: 1.1,
            vehicleSampleIds: [],
          },
        ]}
        selectedH3Cell={null}
        onHexClick={() => {}}
      />,
    )
    expect(getByTestId('mock-map')).toBeInTheDocument()
  })
})
