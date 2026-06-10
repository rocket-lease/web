import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { DashboardPeriod } from '@rocket-lease/contracts'
import { dashboardApi } from '../api/dashboard.api'

/**
 * Métricas de flota del rentador para el período seleccionado.
 * Para `custom` se pasan `from`/`to` (ISO); el resto ignora esos campos.
 * Cambiar período o fechas dispara un refetch por la queryKey.
 */
export function useDashboardMetrics(
  period: DashboardPeriod,
  from?: string,
  to?: string,
) {
  const isCustom = period === 'custom'
  return useQuery({
    queryKey: ['dashboard', 'metrics', period, from ?? null, to ?? null],
    queryFn: () => dashboardApi.getMetrics({ period, from, to }),
    staleTime: 1000 * 60 * 5,
    // Al cambiar de período mantenemos los datos previos (sin parpadeo en la
    // sección General, que es independiente de la fecha).
    placeholderData: keepPreviousData,
    // Para custom, sólo pedimos cuando ambas fechas están definidas.
    enabled: !isCustom || Boolean(from && to),
  })
}
