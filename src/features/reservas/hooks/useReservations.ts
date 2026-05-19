import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { ReservationsListRequest } from '@rocket-lease/contracts'
import { fetchReservations } from '../api/reservations.api'

interface UseReservationsOptions {
  enabled?: boolean
}

/**
 * Hook tanstack-query para listar las reservas del usuario autenticado en
 * cualquiera de las dos perspectivas (`conductor` u `owner`).
 *
 * La queryKey incluye el set completo de filtros (incluyendo `role`), así
 * que la cache queda particionada por perspectiva — alternar el toggle no
 * pisa los resultados del otro lado.
 *
 * Usa `placeholderData: keepPreviousData` para evitar flash en blanco al
 * cambiar de página o de tab, y `staleTime: 30s` para no machacar al
 * backend en navegaciones rápidas.
 *
 * @param filters - Filtros y paginación a propagar al backend. `role` es
 *   requerido; el resto es opcional.
 * @param options.enabled - Condicionar la query (default `true`). Útil cuando
 *   la página decide ejecutar la request en función de otra query previa.
 * @returns Objeto estándar de tanstack-query (`data`, `isLoading`, `error`,
 *   `refetch`, etc.).
 */
export function useReservations(
  filters: ReservationsListRequest,
  { enabled = true }: UseReservationsOptions = {},
) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => fetchReservations(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled,
  })
}
