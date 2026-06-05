import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PricingHexMap } from './PricingHexMap'

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}))
vi.mock('maplibre-gl', () => ({ default: {} }))
vi.mock('react-map-gl/maplibre', () => ({
  Map: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-map">{children}</div>
  ),
  Source: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-source">{children}</div>
  ),
  Layer: () => <div data-testid="mock-layer" />,
}))

describe('PricingHexMap', () => {
  it('renderea sin crashear con la lista de zonas vacía', () => {
    const { getByTestId } = render(
      <PricingHexMap zones={[]} selectedH3Cell={null} onHexClick={() => {}} />,
    )
    expect(getByTestId('mock-map')).toBeInTheDocument()
  })

  it('renderea con zonas con geometría', () => {
    const { getByTestId } = render(
      <PricingHexMap
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
