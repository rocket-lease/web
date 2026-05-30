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
 * Estados de un eslabón que representan una extensión ya comprometida: el
 * rentador la aprobó (o no hacía falta) y forma parte firme del alquiler.
 */
const COMMITTED_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.confirmed,
  RESERVATION_STATUS.in_progress,
  RESERVATION_STATUS.completed,
]

/**
 * Estados de un eslabón que representan una extensión pendiente: solicitada
 * pero todavía no firme (esperando aprobación del rentador o pago del
 * conductor). No deben contarse en la fecha/total efectivos del alquiler.
 */
const PENDING_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.pending_approval,
  RESERVATION_STATUS.pending_payment,
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

/**
 * Devuelve los eslabones comprometidos de la cadena (confirmados, en curso o
 * completados). Si no hay cadena o ningún eslabón está comprometido, devuelve
 * `null` para que el caller use los valores propios de la reserva.
 */
function committedChainMembers(
  reservation: GetReservationResponse,
): GetReservationResponse['chain'] | null {
  const chain = reservation.chain
  if (!chain || chain.length === 0) return null
  const committed = chain.filter((m) => COMMITTED_STATUSES.includes(m.status))
  return committed.length > 0 ? committed : null
}

/**
 * Fecha de devolución comprometida: el `endAt` más tardío de los eslabones
 * firmes de la cadena, ignorando extensiones pendientes de aprobación o pago.
 * Es la fecha que refleja lo que el conductor tiene asegurado.
 */
export function getCommittedChainEndAt(
  reservation: GetReservationResponse,
): string {
  const members = committedChainMembers(reservation)
  if (!members) return reservation.endAt
  return members.reduce(
    (max, m) => (m.endAt > max ? m.endAt : max),
    members[0].endAt,
  )
}

/**
 * Total comprometido: la suma de los `totalCents` de los eslabones firmes de
 * la cadena, ignorando extensiones pendientes.
 */
export function getCommittedChainTotalCents(
  reservation: GetReservationResponse,
): number {
  const members = committedChainMembers(reservation)
  if (!members) return reservation.totalCents
  return members.reduce((sum, m) => sum + m.totalCents, 0)
}

/**
 * Devuelve la extensión pendiente más lejana (la de mayor `endAt` entre las
 * que esperan aprobación o pago), o `null` si no hay ninguna. Sirve para
 * mostrar un indicador de "extensión pendiente" sin contarla como firme.
 */
export function getPendingExtension(
  reservation: GetReservationResponse,
): NonNullable<GetReservationResponse['chain']>[number] | null {
  const chain = reservation.chain
  if (!chain || chain.length === 0) return null
  const pending = chain.filter((m) => PENDING_STATUSES.includes(m.status))
  if (pending.length === 0) return null
  return pending.reduce((latest, m) => (m.endAt > latest.endAt ? m : latest))
}
