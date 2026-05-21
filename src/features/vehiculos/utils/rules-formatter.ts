import type {
  CancellationPolicy,
  DepositPercentage,
  MaxKilometrage,
  RentalTimeConstraints,
  ReservationRuleSet,
} from '@rocket-lease/contracts'
import { t } from '@/i18n/es'

/**
 * Mapeo de políticas de cancelación a labels legibles
 */
const CANCELLATION_POLICY_LABELS: Record<CancellationPolicy, string> = {
  FLEXIBLE: t('reservationRules.cancellation.flexible'),
  MODERATE: t('reservationRules.cancellation.moderate'),
  STRICT: t('reservationRules.cancellation.strict'),
}

/**
 * Descripción completa de una política de cancelación
 */
const CANCELLATION_POLICY_DESCRIPTIONS: Record<CancellationPolicy, string> = {
  FLEXIBLE: t('reservationRules.cancellation.flexibleDesc'),
  MODERATE: t('reservationRules.cancellation.moderateDesc'),
  STRICT: t('reservationRules.cancellation.strictDesc'),
}

/**
 * Obtener label de una política de cancelación
 */
export function getCancellationPolicyLabel(policy: CancellationPolicy): string {
  return CANCELLATION_POLICY_LABELS[policy] ?? policy
}

/**
 * Obtener descripción de una política de cancelación
 */
export function getCancellationPolicyDescription(policy: CancellationPolicy): string {
  return CANCELLATION_POLICY_DESCRIPTIONS[policy] ?? ''
}

/**
 * Obtener label de seña a partir del porcentaje (10-50) o null.
 *
 * - `null` → "Sin seña"
 * - número → "{n}%"
 *
 * Reemplaza la versión basada en enum `Deposit` (US-49).
 */
export function getDepositLabel(depositPercentage: DepositPercentage): string {
  if (depositPercentage === null) {
    return t('reservationRules.deposit.none')
  }
  return t('reservationRules.deposit.formatted').replace(
    '{percentage}',
    String(depositPercentage),
  )
}

/**
 * Formatear kilometraje máximo para display
 */
export function formatMaxKilometrage(km: MaxKilometrage): string {
  if (km.type === 'UNLIMITED') {
    return t('reservationRules.kilometrage.unlimited')
  }
  return `${km.value.toLocaleString('es-AR')} km`
}

/**
 * Formatear restricciones de tiempo de alquiler para display
 */
export function formatRentalTimeConstraints(constraints: RentalTimeConstraints): string {
  if (!constraints.minDays && !constraints.maxDays) {
    return t('reservationRules.rentalTime.noConstraints')
  }

  const parts: string[] = []

  if (constraints.minDays) {
    parts.push(t('reservationRules.rentalTime.minDays') + " " + constraints.minDays + "d")
  }

  if (constraints.maxDays) {
    parts.push(t('reservationRules.rentalTime.maxDays') + " " + constraints.maxDays + "d")
  }

  return parts.join(' • ')
}

/**
 * Generar resumen completo de un set de reglas para display
 */
export function generateRuleSetSummary(ruleSet: ReservationRuleSet): string[] {
  const lines: string[] = []

  lines.push(`📋 ${getCancellationPolicyLabel(ruleSet.cancellationPolicy)}`)
  lines.push(`💰 ${getDepositLabel(ruleSet.depositPercentage)}`)
  lines.push(`🗺️ ${formatMaxKilometrage(ruleSet.maxKilometrage)}`)
  lines.push(`📅 ${formatRentalTimeConstraints(ruleSet.rentalTimeConstraints)}`)

  return lines
}

/**
 * Generar resumen compacto de un set de reglas (una línea)
 */
export function generateRuleSetCompactSummary(ruleSet: ReservationRuleSet): string {
  const parts: string[] = [
    getCancellationPolicyLabel(ruleSet.cancellationPolicy),
    getDepositLabel(ruleSet.depositPercentage),
  ]

  if (ruleSet.maxKilometrage.type === 'LIMITED') {
    parts.push(`${ruleSet.maxKilometrage.value} km`)
  }

  return parts.join(' • ')
}
