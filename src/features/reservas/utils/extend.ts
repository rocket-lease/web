import type { GetReservationResponse } from '@rocket-lease/contracts'
import { getChainStartAt } from './chain'

export const DAY_MS = 24 * 60 * 60 * 1000

export interface RequiresApprovalArgs {
  reservation: GetReservationResponse
  vehicleAutoAccept: boolean | null
  vehicleMaxDays: number | undefined
  newEndAtIso: string | null
}

/**
 * Calcula client-side si la extensión va a entrar como `pending_approval`
 * o como `pending_payment` (inmediata). El backend revalida — esto es solo
 * previsualización para el conductor.
 *
 * Reglas:
 * - Si `autoAccept` no es `true` → requiere aprobación.
 * - Si el chain (padre + extensiones existentes + extensión nueva en días)
 *   excede `maxDays` del set actual del vehículo → requiere aprobación.
 * - Si no hay `maxDays` definido → solo manda el flag `autoAccept`.
 */
export function computeRequiresApproval(args: RequiresApprovalArgs): boolean {
  const { reservation, vehicleAutoAccept, vehicleMaxDays, newEndAtIso } = args
  if (vehicleAutoAccept !== true) return true
  if (!newEndAtIso) return true
  if (typeof vehicleMaxDays !== 'number') return false

  const chainStart = getChainStartAt(reservation)
  const totalDays = Math.ceil(
    (new Date(newEndAtIso).getTime() - new Date(chainStart).getTime()) /
      DAY_MS,
  )
  return totalDays > vehicleMaxDays
}
