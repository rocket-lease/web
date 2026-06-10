import { describe, expect, it } from 'vitest'
import { h3ToGeoBoundary, latLonToH3 } from './h3'

describe('h3ToGeoBoundary', () => {
  it('returns GeoJSON coordinates in [lng, lat] order', () => {
    const cell = latLonToH3(-34.6037, -58.3816)
    const ring = h3ToGeoBoundary(cell)

    expect(ring[0]?.[0]).toBeLessThan(-58)
    expect(ring[0]?.[0]).toBeGreaterThan(-59)
    expect(ring[0]?.[1]).toBeLessThan(-34)
    expect(ring[0]?.[1]).toBeGreaterThan(-35)
  })

  it('closes the polygon ring', () => {
    const cell = latLonToH3(-34.6037, -58.3816)
    const ring = h3ToGeoBoundary(cell)

    expect(ring.at(-1)).toEqual(ring[0])
  })
})
