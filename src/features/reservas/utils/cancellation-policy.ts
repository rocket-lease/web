import type { CancellationPolicy, GetReservationResponse } from '@rocket-lease/contracts'

export type CancellationRefundState =
  | 'missing_policy'
  | 'invalid_dates'
  | 'flexible_active'
  | 'flexible_expired'
  | 'moderate_active'
  | 'moderate_expired'
  | 'strict_active'
  | 'strict_expired'

export interface CancellationRefundSummary {
  state: CancellationRefundState
  policy: CancellationPolicy | null
  deadlineAt: Date | null
  refundPercent: number | null
}

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const FLEXIBLE_DEADLINE_HOURS = 24 // Horas antes del inicio para cancelación con reembolso total
const MODERATE_DEADLINE_HOURS = 48 // Horas antes del inicio para cancelación con reembolso del 50%
const STRICT_PAID_DEADLINE_DAYS = 7 // Días después del pago para cancelación con  reembolso

export function getCancellationRefundSummary(
  reservation: GetReservationResponse,
  nowMs = Date.now(),
): CancellationRefundSummary {
  const ruleSet = reservation.vehicle.reservationRuleSet
  if (!ruleSet) {
    return {
      state: 'missing_policy',
      policy: null,
      deadlineAt: null,
      refundPercent: null,
    }
  }

  const policy = ruleSet.cancellationPolicy
  const startAt = parseIsoDate(reservation.startAt)
  if (!startAt) {
    return {
    state: 'invalid_dates',
    policy,
    deadlineAt: null,
    refundPercent: 100,
    }
  }
  if (policy === 'FLEXIBLE') {
    
    const deadlineAt = new Date(startAt.getTime() - FLEXIBLE_DEADLINE_HOURS * HOUR_MS)
    return {
      state: nowMs <= deadlineAt.getTime() ? 'flexible_active' : 'flexible_expired',
      policy,
      deadlineAt,
      refundPercent: 100,
    }
  }

  if (policy === 'MODERATE') {
    
    const deadlineAt = new Date(startAt.getTime() - MODERATE_DEADLINE_HOURS * HOUR_MS)
    return {
      state: nowMs <= deadlineAt.getTime() ? 'moderate_active' : 'moderate_expired',
      policy,
      deadlineAt,
      refundPercent: 50,
    }
  }

  const paidAt = parseIsoDate(reservation.paidAt)
  if (!paidAt) {
    return {
      state: 'invalid_dates',
      policy,
      deadlineAt: null,
      refundPercent: null,
    }
  }
  const paidDeadlineAt = new Date(paidAt.getTime() + STRICT_PAID_DEADLINE_DAYS * DAY_MS)
  const startDeadlineAt = new Date(startAt.getTime() - MODERATE_DEADLINE_HOURS * HOUR_MS)
  const deadlineAt = paidDeadlineAt.getTime() <= startDeadlineAt.getTime() ? paidDeadlineAt : startDeadlineAt
  return {
    state: nowMs <= deadlineAt.getTime() ? 'strict_active' : 'strict_expired',
    policy,
    deadlineAt,
    refundPercent: null,
  }
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
