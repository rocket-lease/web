import { apiClient } from '@/lib/api-client'
import {
  apiEndpoints,
  type LogVehicleViewRequest,
} from '@rocket-lease/contracts'

/**
 * Cliente de los endpoints de logging zonal. Fire-and-forget desde la web:
 * los handlers del server son no-op si el sessionId no llega, o si el
 * vehículo no existe, así que no necesitamos sincronizar con la UI.
 */
export const geoLogApi = {
  async logVehicleView(payload: LogVehicleViewRequest): Promise<void> {
    await apiClient.post(apiEndpoints.geo.vehicleView, payload)
  },
}
