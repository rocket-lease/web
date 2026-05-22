import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { mapaApi, type MapSearchParams } from '../api/mapa.api'

/**
 * Marcadores del mapa. La query se re-ejecuta al cambiar viewport, zoom o
 * filtros (cambia el `queryKey`) → actualización de marcadores "en tiempo
 * real". `keepPreviousData` evita parpadeos al panear/zoomear.
 *
 * `enabled` permite no disparar la query hasta tener un viewport válido.
 */
export function useMapaRentadoras(
  params: MapSearchParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ['mapa', 'rentadoras', params],
    queryFn: () => mapaApi.searchRentadoras(params as MapSearchParams),
    enabled: enabled && params !== null,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}
