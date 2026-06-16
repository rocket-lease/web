import {
  CalendarCheck,
  FileText,
  CurrencyCircleDollar,
  CheckCircle,
  Car,
  Flag,
  X,
  ClockCountdown,
} from '@phosphor-icons/react'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

interface TimelineEvent {
  at: string
  label: string
  sublabel?: string
  icon: React.ElementType
  color: 'brand' | 'success' | 'danger' | 'muted' | 'warning' | 'amber'
}

const COLOR_CLASSES: Record<TimelineEvent['color'], { dot: string; icon: string }> = {
  brand:   { dot: 'bg-brand-500',   icon: 'text-brand-400' },
  success: { dot: 'bg-success',     icon: 'text-success' },
  danger:  { dot: 'bg-danger',      icon: 'text-danger-400' },
  warning: { dot: 'bg-warning',     icon: 'text-warning' },
  amber:   { dot: 'bg-amber-500',   icon: 'text-amber-400' },
  muted:   { dot: 'bg-surface-3',   icon: 'text-text-muted' },
}

function buildTimeline(reservation: GetReservationResponse): TimelineEvent[] {
  const events: TimelineEvent[] = []

  events.push({
    at: reservation.createdAt,
    label: t('admin.reserva.timeline.created'),
    icon: CalendarCheck,
    color: 'brand',
  })

  if (reservation.contractAcceptedAt) {
    events.push({
      at: reservation.contractAcceptedAt,
      label: t('admin.reserva.timeline.contractAccepted'),
      icon: FileText,
      color: 'muted',
    })
  }

  if (reservation.depositPaidAt && reservation.depositPaidCents) {
    events.push({
      at: reservation.depositPaidAt,
      label: t('admin.reserva.timeline.depositPaid'),
      sublabel: fmt.currency(reservation.depositPaidCents),
      icon: CurrencyCircleDollar,
      color: 'amber',
    })
  }

  if (reservation.paidAt) {
    const isFullPayment = !reservation.depositPaidAt || reservation.depositPaidAt !== reservation.paidAt
    if (isFullPayment) {
      events.push({
        at: reservation.paidAt,
        label: reservation.depositPaidCents
          ? t('admin.reserva.timeline.balancePaid')
          : t('admin.reserva.timeline.paid'),
        sublabel: fmt.currency(reservation.totalCents),
        icon: CheckCircle,
        color: 'success',
      })
    }
  }

  if (reservation.startedAt) {
    events.push({
      at: reservation.startedAt,
      label: t('admin.reserva.timeline.started'),
      icon: Car,
      color: 'brand',
    })
  }

  if (reservation.completedAt) {
    events.push({
      at: reservation.completedAt,
      label: t('admin.reserva.timeline.completed'),
      icon: Flag,
      color: 'success',
    })
  }

  if (reservation.cancelledAt) {
    events.push({
      at: reservation.cancelledAt,
      label: t('admin.reserva.timeline.cancelled'),
      icon: X,
      color: 'danger',
    })
  }

  if (
    (reservation.status === 'expired') &&
    reservation.holdExpiresAt
  ) {
    events.push({
      at: reservation.holdExpiresAt,
      label: t('admin.reserva.timeline.expired'),
      icon: ClockCountdown,
      color: 'danger',
    })
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

interface ReservaTimelineProps {
  reservation: GetReservationResponse
}

export function ReservaTimeline({ reservation }: ReservaTimelineProps) {
  const events = buildTimeline(reservation)

  if (events.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-4">
      <p className="text-sm font-semibold text-amber-400">
        {t('admin.reserva.timeline.title')}
      </p>
      <ol className="space-y-0">
        {events.map((event, idx) => {
          const Icon = event.icon
          const colors = COLOR_CLASSES[event.color]
          const isLast = idx === events.length - 1
          return (
            <li key={event.at + event.label} className="flex gap-3">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${colors.dot}`} />
                {!isLast && <div className="w-px flex-1 bg-white/8 my-1" />}
              </div>
              {/* Content */}
              <div className={`pb-4 min-w-0 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon size={13} weight="duotone" className={`shrink-0 ${colors.icon}`} />
                  <p className="text-sm font-medium text-text-primary leading-tight">{event.label}</p>
                </div>
                {event.sublabel && (
                  <p className="text-xs text-text-secondary mt-0.5">{event.sublabel}</p>
                )}
                <p className="text-xs text-text-muted mt-0.5">{fmt.dateTime(event.at)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
