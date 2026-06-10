import { useEffect, useRef } from 'react'
import { geoLogApi } from '@/features/admin/api/geo-log.api'

/**
 * Loggea una señal `vehicleView` para el vehículo dado en cuanto se monta
 * el detalle. El debounce real lo aplica el backend (por session + hex), así
 * que acá solo evitamos llamadas duplicadas si el mismo `vehicleId` se
 * remontea dentro del mismo ciclo de vida.
 */
export function useLogVehicleView(vehicleId: string | undefined): void {
  const loggedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!vehicleId) return
    if (loggedRef.current === vehicleId) return
    loggedRef.current = vehicleId
    geoLogApi.logVehicleView({ vehicleId }).catch(() => {
      loggedRef.current = null
    })
  }, [vehicleId])
}
