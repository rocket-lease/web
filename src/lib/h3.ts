import { latLngToCell, cellToBoundary } from 'h3-js'

/**
 * Resolución H3 por defecto para Rocket Lease. Aprox. 460 m por celda,
 * adecuado para "zona / barrio chico" sobre CABA.
 */
export const DEFAULT_H3_RESOLUTION = 8

/**
 * Convierte un par de coordenadas a la celda H3 que las contiene.
 */
export function latLonToH3(lat: number, lon: number, resolution: number = DEFAULT_H3_RESOLUTION): string {
  return latLngToCell(lat, lon, resolution)
}

/**
 * Devuelve el polígono cerrado de la celda H3 en formato `[lon, lat]`
 * (orden GeoJSON), repitiendo el primer vértice al final para cerrarlo.
 */
export function h3ToGeoBoundary(cell: string): Array<[number, number]> {
  const boundary = cellToBoundary(cell, true)
  const ring: Array<[number, number]> = boundary.map(([lat, lon]) => [lon, lat])
  if (ring.length > 0) {
    const first = ring[0]!
    const last = ring[ring.length - 1]!
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]])
    }
  }
  return ring
}
