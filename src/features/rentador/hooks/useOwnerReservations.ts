import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { OwnerReservationsListRequest } from '@rocket-lease/contracts'
import { fetchOwnerReservations } from '../api/owner-reservations.api'

interface UseOwnerReservationsOptions {
  enabled?: boolean
}

export function useOwnerReservations(
  filters: Partial<OwnerReservationsListRequest>,
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
