import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { OwnerReservationsListRequest } from '@rocket-lease/contracts'
import { fetchOwnerReservations } from '../api/owner-reservations.api'

export function useOwnerReservations(filters: Partial<OwnerReservationsListRequest>) {
  return useQuery({
    queryKey: ['ownerReservations', filters],
    queryFn: () => fetchOwnerReservations(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
