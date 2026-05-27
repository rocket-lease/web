import type {
  CancellationPolicy,
  GetReservationResponse,
  MaxKilometrage,
  RentalTimeConstraints,
} from '@rocket-lease/contracts'

export type CancellationRefundState =
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
  refundCents: number
}

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const FLEXIBLE_DEADLINE_HOURS = 24 // Horas antes del inicio para cancelación con reembolso total
const MODERATE_DEADLINE_HOURS = 48 // Horas antes del inicio para cancelación con reembolso del 50%
const STRICT_PAID_DEADLINE_DAYS = 7 // Días después del pago para cancelación con  reembolso
const STRICT_MIN_HOURS_BEFORE_START = 48
const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = 'FLEXIBLE'

export interface EffectiveReservationRules {
  cancellationPolicy: CancellationPolicy
  depositPercentage: number | null
  maxKilometrage: MaxKilometrage
  rentalTimeConstraints: RentalTimeConstraints
}

/**
 * Devuelve las reglas que rigen una reserva. Para reservas con pago confirmado
 * usa el snapshot inmutable capturado al confirmar; para reservas previas al
 * pago usa el set vigente del vehículo. Cualquier consumidor que muestre o
 * calcule sobre las reglas debe consumir este helper, no leer los campos sueltos.
 */
export function getEffectiveReservationRules(
  reservation: GetReservationResponse,
): EffectiveReservationRules {
  if (reservation.paidAt !== null) {
    return {
      cancellationPolicy: reservation.cancellationPolicySnapshot,
      depositPercentage: reservation.depositPercentageSnapshot,
      maxKilometrage: reservation.maxKilometrageSnapshot,
      rentalTimeConstraints: reservation.rentalTimeConstraintsSnapshot,
    }
  }
  const live = reservation.vehicle.reservationRuleSet
  return {
    cancellationPolicy: live?.cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY,
    depositPercentage: live?.depositPercentage ?? null,
    maxKilometrage: live?.maxKilometrage ?? { type: 'UNLIMITED' },
    rentalTimeConstraints: live?.rentalTimeConstraints ?? {},
  }
}

export function getCancellationRefundSummary(
  reservation: GetReservationResponse,
  nowMs = Date.now(),
): CancellationRefundSummary {
  const policy = getEffectiveReservationRules(reservation).cancellationPolicy
  const startAt = parseIsoDate(reservation.startAt)
  if (!startAt) {
    return {
      state: 'invalid_dates',
      policy,
      deadlineAt: null,
      refundPercent: null,
      refundCents: 0,
    }
  }
  if (policy === 'FLEXIBLE') {
    const deadlineAt = new Date(startAt.getTime() - FLEXIBLE_DEADLINE_HOURS * HOUR_MS)
    const refundPercent = nowMs <= deadlineAt.getTime() ? 100 : 0
    return {
      state: refundPercent > 0 ? 'flexible_active' : 'flexible_expired',
      policy,
      deadlineAt,
      refundPercent,
      refundCents: Math.floor((reservation.totalCents * refundPercent) / 100),
    }
  }

  if (policy === 'MODERATE') {
    const deadlineAt = new Date(startAt.getTime() - MODERATE_DEADLINE_HOURS * HOUR_MS)
    const refundPercent = nowMs <= deadlineAt.getTime() ? 50 : 0
    return {
      state: refundPercent > 0 ? 'moderate_active' : 'moderate_expired',
      policy,
      deadlineAt,
      refundPercent,
      refundCents: Math.floor((reservation.totalCents * refundPercent) / 100),
    }
  }

  const paidAt = parseIsoDate(reservation.paidAt)
  if (!paidAt) {
    return {
      state: 'invalid_dates',
      policy,
      deadlineAt: null,
      refundPercent: null,
      refundCents: 0,
    }
  }
  const paidDeadlineAt = new Date(paidAt.getTime() + STRICT_PAID_DEADLINE_DAYS * DAY_MS)
  const startDeadlineAt = new Date(startAt.getTime() - STRICT_MIN_HOURS_BEFORE_START * HOUR_MS)
  const deadlineAt = paidDeadlineAt.getTime() <= startDeadlineAt.getTime() ? paidDeadlineAt : startDeadlineAt
  const isWithinPaidWindow = nowMs <= paidDeadlineAt.getTime()
  const hasMoreThan48Hours = nowMs < startDeadlineAt.getTime()
  const refundPercent = isWithinPaidWindow && hasMoreThan48Hours ? 100 : 0
  return {
    state: refundPercent > 0 ? 'strict_active' : 'strict_expired',
    policy,
    deadlineAt,
    refundPercent,
    refundCents: Math.floor((reservation.totalCents * refundPercent) / 100),
  }
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
