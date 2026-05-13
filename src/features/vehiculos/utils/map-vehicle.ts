// // import type { GetVehicleResponse } from '@rocket-lease/contracts'
// // import type { Vehiculo } from '../types'

// export function fromApiToVehiculo(v: GetVehicleResponse): Vehiculo {
//   return {
//     id:           v.id,
//     rentadorId:   v.ownerId,
//     marca:        v.brand,
//     modelo:       v.model,
//     anio:         v.year,
//     patente:      v.plate,
//     transmission: v.transmission === 'Manual' ? 'manual' : 'automatic',
//     asientos:     v.passengers,
//     combustible:  'nafta',
//     descripcion:  v.description ?? '',
//     tags:         [],
//     tarifa:       { daily: v.basePrice },
//     fotos:        v.photos.map((url, i) => ({ id: String(i), url, order: i })),
//     disponible:   v.enabled,
//     rating:       0,
//     reviewCount:  0,
//     ubicacion:    { direccion: v.city, lat: 0, lng: 0, ciudad: v.city },
//     rentador:     { id: v.ownerId, nombre: '', rating: 0, reviewCount: 0, level: 'bronze' },
//     createdAt:    new Date().toISOString(),
//   }
// }
