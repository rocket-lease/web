import { ClockCountdown, CircleNotch } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'

interface QuoteExpirationBannerProps {
  secondsLeft: number
  percentLeft: number
  isRecalculating: boolean
  label: string
}

const WARNING_THRESHOLD_SECONDS = 15

/**
 * Banner persistente que muestra el tiempo restante de validez del
 * `quoteToken` durante el flujo de reserva. Pasa por tres estados visuales:
 * normal (verde), warning (ámbar con countdown animado en los últimos 15s) y
 * recalculating (expandido con spinner mientras se recotiza).
 */
export function QuoteExpirationBanner({
  secondsLeft,
  percentLeft,
  isRecalculating,
  label,
}: QuoteExpirationBannerProps) {
  const isWarning =
    !isRecalculating && secondsLeft <= WARNING_THRESHOLD_SECONDS && secondsLeft > 0

  return (
    <div className="border-b border-white/6 bg-surface-0/95 backdrop-blur-md">
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-out',
          isRecalculating ? 'max-h-32' : 'max-h-12',
        )}
      >
        {isRecalculating ? (
          <div className="flex items-center gap-3 px-4 py-3 transition-opacity duration-300 ease-out">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10">
              <CircleNotch size={18} weight="bold" className="animate-spin text-brand-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {t('reservar.quote.expired.title')}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {t('reservar.quote.expired.message')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <ClockCountdown
                size={20}
                weight="duotone"
                className={cn(
                  'shrink-0 transition-colors duration-200',
                  isWarning ? 'animate-pulse text-amber-400' : 'text-brand-400',
                )}
              />
              <span className="truncate text-sm text-text-secondary">
                {t('reservar.quote.validFor.label')}
              </span>
            </div>
            <span
              className={cn(
                'shrink-0 tabular-nums transition-all duration-200 ease-out',
                isWarning
                  ? 'animate-pulse text-base font-semibold text-amber-400'
                  : 'text-sm font-medium text-text-primary',
              )}
            >
              {label}
            </span>
          </div>
        )}
      </div>
      <div className="h-0.5 w-full overflow-hidden bg-white/5">
        <div
          className={cn(
            'h-full transition-[width] duration-1000 ease-linear',
            isRecalculating
              ? 'w-full animate-pulse bg-brand-500/50'
              : isWarning
                ? 'bg-amber-400'
                : 'bg-brand-500',
          )}
          style={isRecalculating ? undefined : { width: `${percentLeft}%` }}
        />
      </div>
    </div>
  )
}
