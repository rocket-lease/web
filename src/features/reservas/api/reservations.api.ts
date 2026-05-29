import { apiClient } from '@/lib/api-client'
import {
  ApproveReservationResponseSchema,
  ConfirmPickupResponseSchema,
  ConfirmReturnResponseSchema,
  ExtendReservationResponseSchema,
  RejectReservationResponseSchema,
  ReservationsListResponseSchema,
  type ApproveReservationResponse,
  type ConfirmPickupResponse,
  type ConfirmReturnResponse,
  type ExtendReservationRequest,
  type ExtendReservationResponse,
  type RejectReservationRequest,
  type RejectReservationResponse,
  type ReservationsListRequest,
  type ReservationsListResponse,
} from '@rocket-lease/contracts'

/**
 * Lista las reservas del usuario autenticado desde la perspectiva indicada.
 *
 * Wrapper sobre el endpoint REST unificado `GET /reservations?role=...&...`.
 * El parámetro `role` viene en `params` (no fijado en el wrapper) para soportar
 * tanto la vista conductor como rentador desde la página unificada `/reservas`.
 *
 * @param params - Filtros y paginación. `role` es obligatorio (`conductor` u `owner`).
 *   `status` se serializa como query param repetido (`status=a&status=b`).
 * @returns Respuesta paginada validada contra el schema (`items`, `page`,
 *   `pageSize`, `total`).
 * @throws ProblemDetails si la API devuelve un error HTTP no-OK.
 * @throws ZodError si la respuesta no matchea `ReservationsListResponseSchema`.
 */
export async function fetchReservations(
  params: ReservationsListRequest,
): Promise<ReservationsListResponse> {
  const search = new URLSearchParams()
  search.set('role', params.role)
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

/**
 * Solicita extender una reserva en curso hasta un nuevo `endAt`.
 *
 * Crea una reserva contigua con `parentReservationId` apuntando al padre.
 * El estado resultante depende de la configuración del vehículo y del max
 * acumulado del chain:
 * - `pending_payment` con hold de 10min cuando el rentador tiene autoAccept
 *   y el chain entra en `maxDays` del set actual.
 * - `pending_approval` cuando el rentador requiere aprobación o el chain
 *   excede `maxDays`.
 *
 * @param reservationId - UUID del padre o de un eslabón del chain. El backend
 *   resuelve la "punta" del chain y cuelga la extensión de ese eslabón.
 * @param newEndAt - Nuevo `endAt` ISO 8601 UTC. Debe ser mayor al `endAt`
 *   actual de la punta del chain.
 * @returns Respuesta validada con `id`, `status`, `holdExpiresAt`,
 *   `totalCents`, `currency` y `requiresApproval`.
 * @throws ProblemDetails si la API rechaza la acción (403, 409, etc.).
 */
export async function extendReservation(
  reservationId: string,
  newEndAt: string,
): Promise<ExtendReservationResponse> {
  const body: ExtendReservationRequest = { newEndAt }
  const raw = await apiClient.post<unknown>(
    `/reservations/${reservationId}/extend`,
    body,
  )
  return ExtendReservationResponseSchema.parse(raw)
}

export async function confirmPickup(
  voucherToken: string,
): Promise<ConfirmPickupResponse> {
  const raw = await apiClient.post<unknown>('/reservations/pickup', { voucherToken })
  return ConfirmPickupResponseSchema.parse(raw)
}

export async function confirmReturn(
  returnQrToken: string,
): Promise<ConfirmReturnResponse> {
  const raw = await apiClient.post<unknown>('/reservations/return', { returnQrToken })
  return ConfirmReturnResponseSchema.parse(raw)
}
