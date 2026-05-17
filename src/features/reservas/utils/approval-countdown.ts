import { t } from '@/i18n/es'

/**
 * Formatea el countdown del TTL de una solicitud pending_approval para mostrar
 * al conductor. Granularidad de horas redondeadas hacia abajo; bajo 1 hora
 * muestra un texto distinto; pasado el deadline marca "Solicitud vencida".
 */
export function formatApprovalCountdown(
  holdExpiresAt: string | null,
  nowMs = Date.now(),
): string {
  if (!holdExpiresAt) return ''
  const remainingMs = new Date(holdExpiresAt).getTime() - nowMs
  if (remainingMs <= 0) return t('conductor.reservas.venceVencido')
  const hours = Math.floor(remainingMs / 3_600_000)
  if (hours < 1) return t('conductor.reservas.venceEnMenosDe1Hora')
  return t('conductor.reservas.venceEnHoras').replace('{count}', String(hours))
}
