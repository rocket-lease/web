import { Link } from '@tanstack/react-router'
import { WarningCircle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useMyTickets } from '../hooks/useMyTickets'
import type { TicketStatus } from '@rocket-lease/contracts'

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  closed: 'bg-surface-3 text-text-muted border-white/10',
}

const statusLabels: Record<TicketStatus, string> = {
  open: 'tickets.status.open',
  under_review: 'tickets.status.under_review',
  resolved: 'tickets.status.resolved',
  closed: 'tickets.status.closed',
}

export function MisTicketsSection() {
  const { data: tickets, isLoading } = useMyTickets()

  if (isLoading) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-text-primary px-1">{t('tickets.misTickets.title')}</p>

      {!tickets || tickets.length === 0 ? (
        <p className="text-sm text-text-muted px-1">{t('tickets.misTickets.empty')}</p>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to="/soporte/tickets/$id"
              params={{ id: ticket.id }}
              className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <WarningCircle className="h-5 w-5 text-warning shrink-0" weight="duotone" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {ticket.subject || t('tickets.misTickets.soporte')}
                  </p>
                  <p className="text-xs text-text-muted">
                    {ticket.reservationId
                      ? `${t('tickets.misTickets.reservaPrefix')}${ticket.reservationId.slice(0, 8)}`
                      : t('tickets.misTickets.soporte')}
                    {' · '}{fmt.dateShort(ticket.createdAt)}
                  </p>
                </div>
              </div>
              <Badge className={statusStyles[ticket.status]}>
                {t(statusLabels[ticket.status] as Parameters<typeof t>[0])}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
