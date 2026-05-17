import { apiClient } from '@/lib/api-client'
import {
  ApproveReservationResponseSchema,
  RejectReservationResponseSchema,
  type ApproveReservationResponse,
  type RejectReservationRequest,
  type RejectReservationResponse,
  type ReservationsListRequest,
  type ReservationsListResponse,
  ReservationsListResponseSchema,
} from '@rocket-lease/contracts'

/**
 * Lista las reservas en las que el usuario autenticado actúa como **owner**
 * (rentador) — es decir, reservas sobre vehículos que él publicó.
 *
 * Wrapper sobre el endpoint REST unificado `GET /reservations?role=owner&...`.
 * El parámetro `role` queda fijo en `owner` por el caller (panel del rentador);
 * por eso el tipo del param excluye esa key.
 *
 * @param params - Filtros opcionales (`status[]`, `from`, `to`) y paginación
 *   (`page`, `pageSize`). Si no se pasa nada, el backend aplica defaults
 *   (`page=1`, `pageSize=20`).
 * @returns Respuesta paginada validada contra el schema (`items`, `page`,
 *   `pageSize`, `total`).
 * @throws ProblemDetails si la API devuelve un error HTTP no-OK.
 * @throws ZodError si la respuesta no matchea `ReservationsListResponseSchema`.
 */
export async function fetchOwnerReservations(
  params: Omit<Partial<ReservationsListRequest>, 'role'>,
): Promise<ReservationsListResponse> {
  const search = new URLSearchParams()
  search.set('role', 'owner')
  params.status?.forEach((s) => search.append('status', s))
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const raw = await apiClient.get<unknown>(`/reservations?${search.toString()}`)
  return ReservationsListResponseSchema.parse(raw)
}

/**
 * Aprueba una solicitud de reserva (`pending_approval` → `pending_payment`).
 * Solo el rentador dueño del vehículo puede ejecutar esta acción.
 *
 * Dispara también la cascada server-side de auto-rechazo sobre solicitudes
 * solapadas en el mismo rango (decisión de concurrencia permisiva).
 *
 * @param reservationId - UUID de la reserva en estado `pending_approval`.
 * @returns Respuesta validada con `{ id, status: 'pending_payment', holdExpiresAt }`.
 * @throws ProblemDetails si la API rechaza la acción (403, 409, etc.).
 */
export async function approveReservation(
  reservationId: string,
): Promise<ApproveReservationResponse> {
  const raw = await apiClient.post<unknown>(
    `/reservations/${reservationId}/approve`,
    {},
  )
  return ApproveReservationResponseSchema.parse(raw)
}

/**
 * Rechaza una solicitud de reserva (`pending_approval` → `rejected`).
 *
 * @param reservationId - UUID de la reserva en estado `pending_approval`.
 * @param reason - Texto opcional con la razón del rechazo (max 280 chars).
 *   Se envía en el body solo cuando viene presente.
 * @returns Respuesta validada con `{ id, status: 'rejected', rejectionReason }`.
 * @throws ProblemDetails si la API rechaza la acción.
 */
export async function rejectReservation(
  reservationId: string,
  reason?: string,
): Promise<RejectReservationResponse> {
  const body: RejectReservationRequest = reason ? { reason } : {}
  const raw = await apiClient.post<unknown>(
    `/reservations/${reservationId}/reject`,
    body,
  )
  return RejectReservationResponseSchema.parse(raw)
}
