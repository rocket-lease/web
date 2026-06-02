import {
  RESERVATION_STATUS,
  type GetReservationResponse,
} from '@rocket-lease/contracts'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

const COMMITTED_STATUSES = [
  RESERVATION_STATUS.confirmed,
  RESERVATION_STATUS.in_progress,
  RESERVATION_STATUS.completed,
]

interface ReservaPricingBreakdownProps {
  reservation: GetReservationResponse
  totalLabel?: string
}

export function ReservaPricingBreakdown({
  reservation,
  totalLabel = 'Total',
}: ReservaPricingBreakdownProps) {
  const { pricingSnapshot } = reservation
  const chain = reservation.chain ?? []

  const committedExtensions = chain.filter(
    (m) => m.parentReservationId !== null && (COMMITTED_STATUSES as readonly string[]).includes(m.status),
  )

  const showOriginal = !!pricingSnapshot.appliedDiscountTier
  const showExtensions = committedExtensions.some(
    (m) => !!m.pricingSnapshot.appliedDiscountTier,
  )

  if (!showOriginal && !showExtensions) return null

  const originalSavings = pricingSnapshot.discountCents
  const extensionSavings = committedExtensions.reduce(
    (sum, m) => sum + m.pricingSnapshot.discountCents,
    0,
  )
  const totalSavings = originalSavings + extensionSavings

  const originalTotal = pricingSnapshot.totalCents
  const extensionTotal = committedExtensions.reduce(
    (sum, m) => sum + m.totalCents,
    0,
  )

  return (
    <div className="rounded-xl border border-brand-400/20 bg-brand-400/5 p-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
        {t('reservas.detail.breakdown.title')}
      </p>

      {showOriginal && (
        <PricingSection
          label={t('reservas.detail.breakdown.original')}
          subtotalCents={pricingSnapshot.subtotalCents}
          discountCents={pricingSnapshot.discountCents}
          appliedDiscountTier={pricingSnapshot.appliedDiscountTier}
          totalCents={originalTotal}
        />
      )}

      {committedExtensions.map((ext, i) => {
        if (!ext.pricingSnapshot.appliedDiscountTier) return null
        return (
          <PricingSection
            key={ext.id}
            label={t('reservas.detail.breakdown.extension').replace('{n}', String(i + 1))}
            subtotalCents={ext.pricingSnapshot.subtotalCents}
            discountCents={ext.pricingSnapshot.discountCents}
            appliedDiscountTier={ext.pricingSnapshot.appliedDiscountTier}
            totalCents={ext.totalCents}
          />
        )
      })}

      <div className="flex items-center justify-between text-sm pt-1 border-t border-white/8">
        <span className="font-semibold text-text-primary">{totalLabel}</span>
        <span className="font-semibold text-brand-400">
          {fmt.currency(originalTotal + extensionTotal)}
        </span>
      </div>

      <p className="text-xs text-brand-400/80">
        {t('reservas.detail.breakdown.totalSavings')}: {fmt.currency(totalSavings)}
      </p>
    </div>
  )
}

interface PricingSectionProps {
  label: string
  subtotalCents: number
  discountCents: number
  appliedDiscountTier: { minimumDays: number; discountPercentage: number } | null
  totalCents: number
}

function PricingSection({
  label,
  subtotalCents,
  discountCents,
  appliedDiscountTier,
  totalCents,
}: PricingSectionProps) {
  return (
    <>
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider pt-1">
        {label}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{t('reservar.breakdown.subtotal')}</span>
        <span className="text-text-primary">{fmt.currency(subtotalCents)}</span>
      </div>
      {appliedDiscountTier && (
        <div className="flex items-center justify-between text-sm text-brand-400">
          <span>
            {t('reservar.breakdown.discount')}{' '}
            {t('reservar.breakdown.appliedTier')
              .replace('{days}', String(appliedDiscountTier.minimumDays))
              .replace('{percentage}', String(appliedDiscountTier.discountPercentage))}
          </span>
          <span>-{fmt.currency(discountCents)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{t('reservas.detail.total')}</span>
        <span className="text-text-primary">{fmt.currency(totalCents)}</span>
      </div>
    </>
  )
}
