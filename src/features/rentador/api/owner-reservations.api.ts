import { apiClient } from '@/lib/api-client'
import {
  type ReservationsListRequest,
  type ReservationsListResponse,
  ReservationsListResponseSchema,
} from '@rocket-lease/contracts'

export async function fetchOwnerReservations(
  params: Omit<Partial<ReservationsListRequest>, 'role'>,
): Promise<ReservationsListResponse> {
  const search = new URLSearchParams()
  // role=owner es fijo para este wrapper (panel del rentador).
  search.set('role', 'owner')
  params.status?.forEach((s) => search.append('status', s))
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const raw = await apiClient.get<unknown>(`/reservations?${search.toString()}`)
  return ReservationsListResponseSchema.parse(raw)
}
