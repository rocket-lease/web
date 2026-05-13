import type { GetVehicleResponse } from '@rocket-lease/contracts'

export interface FavoritoItem {
  id: string
  vehicleId: string
  createdAt: string
}

export interface FavoritoConDetalle extends FavoritoItem {
  vehiculo: GetVehicleResponse | null
}
