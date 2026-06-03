import { WarningCircle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useReservationTickets } from '../hooks/useReservationTickets'
import type { TicketStatus } from '@rocket-lease/contracts'

interface ReservaTicketInfoProps {
  reservationId: string
  myRole: 'conductor' | 'rentador'
}

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  rejected: 'bg-danger text-white border-danger',
}

const statusLabels: Record<TicketStatus, Parameters<typeof t>[0]> = {
  open: 'tickets.status.open',
  under_review: 'tickets.status.under_review',
  resolved: 'tickets.status.resolved',
  rejected: 'tickets.status.rejected',
}

export function ReservaTicketInfo({ reservationId, myRole }: ReservaTicketInfoProps) {
  const { data: tickets } = useReservationTickets(reservationId)

  if (!tickets || tickets.length === 0) return null

  const myTicket = tickets.find((tk) => tk.reportedBy === myRole)
  const counterpartTicket = tickets.find((tk) => tk.reportedBy !== myRole)

  return (
    <div className="space-y-3">
      {myTicket && (
        <div className="rounded-xl bg-surface-2 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WarningCircle className="h-4 w-4 text-warning shrink-0" weight="duotone" />
              <span className="text-xs font-semibold text-text-primary">
                {t('tickets.reserva.tuReporte')}
              </span>
            </div>
            <Badge className={statusStyles[myTicket.status]}>
              {t(statusLabels[myTicket.status])}
            </Badge>
          </div>
          <p className="text-xs text-text-muted line-clamp-2">{myTicket.description}</p>
          <p className="text-xs text-text-muted">{fmt.dateShort(myTicket.createdAt)}</p>
        </div>
      )}

      {counterpartTicket && (
        <div className="rounded-xl bg-surface-2/60 border border-white/6 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WarningCircle className="h-4 w-4 text-text-muted shrink-0" weight="regular" />
              <span className="text-xs font-semibold text-text-secondary">
                {t('tickets.reserva.reporteContraparte')}
              </span>
            </div>
            <Badge className={statusStyles[counterpartTicket.status]}>
              {t(statusLabels[counterpartTicket.status])}
            </Badge>
          </div>
          <p className="text-xs text-text-muted line-clamp-2">{counterpartTicket.description}</p>
          <p className="text-xs text-text-muted">{fmt.dateShort(counterpartTicket.createdAt)}</p>
        </div>
      )}
    </div>
  )
}
