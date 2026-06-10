import { cellToBoundary, cellToLatLng, latLngToCell, polygonToCells } from 'h3-js'

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
  const ring = cellToBoundary(cell, true) as Array<[number, number]>
  if (ring.length > 0) {
    const first = ring[0]!
    const last = ring[ring.length - 1]!
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]])
    }
  }
  return ring
}

/**
 * Devuelve el centro de la celda H3 como `{lat, lng}`, listo para anclar
 * markers de Google Maps.
 */
export function h3CellCenter(cell: string): { lat: number; lng: number } {
  const [lat, lng] = cellToLatLng(cell)
  return { lat, lng }
}

/**
 * Polígono aproximado de CABA (Ciudad Autónoma de Buenos Aires) en formato
 * `[lat, lon]`. Sigue Av. Gral. Paz al N/O, el Río de la Plata al E y el
 * Riachuelo al S. No es exacto al milímetro pero alcanza para dibujar la
 * grilla de zonas en el admin map.
 */
export const CABA_POLYGON_LAT_LON: Array<[number, number]> = [
  [-34.5265, -58.5301],
  [-34.5290, -58.4530],
  [-34.5410, -58.4170],
  [-34.5550, -58.3850],
  [-34.5670, -58.3620],
  [-34.5990, -58.3360],
  [-34.6300, -58.3360],
  [-34.6500, -58.3540],
  [-34.6630, -58.3720],
  [-34.6790, -58.4020],
  [-34.6860, -58.4380],
  [-34.6850, -58.4780],
  [-34.6720, -58.5180],
  [-34.6420, -58.5320],
  [-34.6020, -58.5320],
  [-34.5640, -58.5260],
  [-34.5265, -58.5301],
]

/**
 * Computa todas las celdas H3 a una resolución dada que están dentro del
 * polígono indicado (formato `[lat, lon]`). Pensado para grillas estáticas
 * sobre regiones acotadas como CABA.
 */
export function cellsInPolygon(
  polygonLatLon: Array<[number, number]>,
  resolution: number = DEFAULT_H3_RESOLUTION,
): string[] {
  return polygonToCells(polygonLatLon, resolution)
}
