import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { WarningCircle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useMyTickets } from '@/features/soporte/hooks/useMyTickets'
import { useTicketsAgainstMe } from '@/features/soporte/hooks/useTicketsAgainstMe'
import type { TicketResponse, TicketStatus } from '@rocket-lease/contracts'

type Tab = 'mios' | 'contra'

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

function TicketRow({ ticket }: { ticket: TicketResponse }) {
  return (
    <Link
      to="/reservas/$id"
      params={{ id: ticket.reservationId }}
      className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <WarningCircle className="h-5 w-5 text-warning shrink-0" weight="duotone" />
        <div className="min-w-0">
          <p className="text-xs text-text-muted truncate">
            {t('tickets.misTickets.reservaPrefix')}{ticket.reservationId.slice(0, 8)}
          </p>
          <p className="text-xs text-text-muted">{fmt.dateShort(ticket.createdAt)}</p>
        </div>
      </div>
      <Badge className={statusStyles[ticket.status]}>
        {t(statusLabels[ticket.status])}
      </Badge>
    </Link>
  )
}

export function MisReportesPage() {
  const [tab, setTab] = useState<Tab>('mios')
  const { data: mios, isLoading: loadingMios } = useMyTickets()
  const { data: contra, isLoading: loadingContra } = useTicketsAgainstMe()

  const isLoading = tab === 'mios' ? loadingMios : loadingContra
  const items = tab === 'mios' ? mios : contra
  const emptyKey = tab === 'mios' ? 'tickets.misTickets.empty' : 'tickets.contra.empty'

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('perfil.reportes.title')} showBack />

      {/* Tabs */}
      <div className="px-4 pt-4 flex gap-2 border-b border-white/6 pb-0">
        {(['mios', 'contra'] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-brand-400 text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {t(key === 'mios' ? 'perfil.reportes.tabMios' : 'perfil.reportes.tabContra')}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 pb-24">
        {isLoading ? (
          <p className="text-sm text-text-muted">{t('general.loading')}</p>
        ) : !items || items.length === 0 ? (
          <p className="text-sm text-text-muted">{t(emptyKey)}</p>
        ) : (
          items.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </div>
  )
}
