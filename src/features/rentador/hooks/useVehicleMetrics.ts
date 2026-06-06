import { useQuery } from '@tanstack/react-query'
import type { DashboardPeriod } from '@rocket-lease/contracts'
import { dashboardApi } from '../api/dashboard.api'

/**
 * Detalle de métricas (ingresos, ocupación y cancelaciones) de un vehículo
 * para el período seleccionado. Soporta rango `custom` con `from`/`to`.
 */
export function useVehicleMetrics(
  vehicleId: string,
  period: DashboardPeriod,
  from?: string,
  to?: string,
) {
  const isCustom = period === 'custom'
  return useQuery({
    queryKey: ['dashboard', 'vehicle', vehicleId, period, from ?? null, to ?? null],
    queryFn: () => dashboardApi.getVehicleMetrics(vehicleId, { period, from, to }),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(vehicleId) && (!isCustom || Boolean(from && to)),
  })
}
