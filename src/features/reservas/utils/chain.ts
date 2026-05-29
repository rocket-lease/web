import {
  RESERVATION_STATUS,
  type GetReservationResponse,
  type ReservationStatus,
} from '@rocket-lease/contracts'

const TERMINAL_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.cancelled,
  RESERVATION_STATUS.rejected,
  RESERVATION_STATUS.expired,
]

/**
 * Devuelve los eslabones vigentes de la cadena de una reserva (padre +
 * extensiones que no estén canceladas, rechazadas ni expiradas). Si la
 * reserva no expone cadena, devuelve `null` para que el caller use los
 * valores propios de la reserva.
 */
function activeChainMembers(
  reservation: GetReservationResponse,
): GetReservationResponse['chain'] | null {
  const chain = reservation.chain
  if (!chain || chain.length === 0) return null
  const active = chain.filter((m) => !TERMINAL_STATUSES.includes(m.status))
  return active.length > 0 ? active : chain
}

/**
 * Fecha de inicio efectiva de una reserva: el `startAt` más temprano de su
 * cadena vigente, o el `startAt` propio si no hay cadena.
 */
export function getChainStartAt(reservation: GetReservationResponse): string {
  const members = activeChainMembers(reservation)
  if (!members) return reservation.startAt
  return members.reduce(
    (min, m) => (m.startAt < min ? m.startAt : min),
    members[0].startAt,
  )
}

/**
 * Fecha de devolución efectiva de una reserva: el `endAt` más tardío de su
 * cadena vigente, o el `endAt` propio si no hay cadena.
 */
export function getChainEndAt(reservation: GetReservationResponse): string {
  const members = activeChainMembers(reservation)
  if (!members) return reservation.endAt
  return members.reduce(
    (max, m) => (m.endAt > max ? m.endAt : max),
    members[0].endAt,
  )
}

/**
 * Total efectivo de una reserva: la suma de los `totalCents` de los eslabones
 * vigentes de su cadena, o el `totalCents` propio si no hay cadena.
 */
export function getChainTotalCents(reservation: GetReservationResponse): number {
  const members = activeChainMembers(reservation)
  if (!members) return reservation.totalCents
  return members.reduce((sum, m) => sum + m.totalCents, 0)
}
