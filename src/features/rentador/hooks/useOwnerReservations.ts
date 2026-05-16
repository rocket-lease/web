import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { ReservationsListRequest } from '@rocket-lease/contracts'
import { fetchOwnerReservations } from '../api/owner-reservations.api'

interface UseOwnerReservationsOptions {
  enabled?: boolean
}

/**
 * Hook de tanstack-query para listar las reservas del rentador autenticado
 * desde el panel.
 *
 * Cachea los resultados por queryKey (incluye los filtros), con `staleTime`
 * de 30s y `placeholderData: keepPreviousData` para que el cambio de página
 * no muestre flash en blanco.
 *
 * @param filters - Filtros y paginación a propagar al backend. La key `role`
 *   está excluida porque el wrapper la fija en `owner`.
 * @param options.enabled - Permite condicionar la query (default `true`). Útil
 *   cuando la página decide ejecutar la request solo si otra cosa está lista.
 * @returns El objeto estándar de tanstack-query (`data`, `isLoading`, `error`,
 *   `refetch`, etc.).
 */
export function useOwnerReservations(
  filters: Omit<Partial<ReservationsListRequest>, 'role'>,
  { enabled = true }: UseOwnerReservationsOptions = {},
) {
  return useQuery({
    queryKey: ['ownerReservations', filters],
    queryFn: () => fetchOwnerReservations(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled,
  })
}
