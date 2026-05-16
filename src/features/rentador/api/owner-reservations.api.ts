import { apiClient } from '@/lib/api-client'
import {
  type OwnerReservationsListRequest,
  type OwnerReservationsListResponse,
  OwnerReservationsListResponseSchema,
} from '@rocket-lease/contracts'

export async function fetchOwnerReservations(
  params: Partial<OwnerReservationsListRequest>,
): Promise<OwnerReservationsListResponse> {
  const search = new URLSearchParams()
  params.status?.forEach((s) => search.append('status', s))
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  const raw = await apiClient.get<unknown>(
    `/reservations/owned${qs ? `?${qs}` : ''}`,
  )
  return OwnerReservationsListResponseSchema.parse(raw)
}
