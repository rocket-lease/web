import type { Vehiculo } from '@/features/vehiculos/types'

export interface FavoritoItem {
  id: string
  vehicleId: string
  createdAt: string
}

export interface FavoritoConDetalle extends FavoritoItem {
  vehiculo: Vehiculo | null
}
