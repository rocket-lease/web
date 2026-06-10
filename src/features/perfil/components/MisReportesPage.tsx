import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, CalendarBlank, ChatCircleDots, Headset, WarningCircle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useMyTickets } from '@/features/soporte/hooks/useMyTickets'
import { useTicketsAgainstMe } from '@/features/soporte/hooks/useTicketsAgainstMe'
import { ReportarProblemaSheet } from '@/features/soporte/components/ReportarProblemaSheet'
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
    <div className="rounded-xl bg-surface-2 overflow-hidden">
      {/* Primary: chat del ticket */}
      <Link
        to="/soporte/tickets/$id"
        params={{ id: ticket.id }}
        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-1 transition-colors active:scale-[0.99]"
      >
        <WarningCircle className="h-5 w-5 text-warning shrink-0" weight="duotone" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {ticket.subject || t('tickets.misTickets.soporte')}
          </p>
          <p className="text-xs text-text-muted">{fmt.dateShort(ticket.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={statusStyles[ticket.status]}>
            {t(statusLabels[ticket.status])}
          </Badge>
          <ChatCircleDots size={16} className="text-brand-400" weight="duotone" />
        </div>
      </Link>

      {/* Secondary: link a la reserva asociada (solo si existe) */}
      {ticket.reservationId && (
        <Link
          to="/reservas/$id"
          params={{ id: ticket.reservationId }}
          className="flex items-center gap-2 border-t border-white/6 px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-1 transition-colors"
        >
          <CalendarBlank size={13} weight="duotone" className="text-brand-400 shrink-0" />
          <span className="flex-1">{t('tickets.misTickets.reservaPrefix')}{ticket.reservationId.slice(0, 8)}</span>
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}

export function MisReportesPage() {
  const [tab, setTab] = useState<Tab>('mios')
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigate = useNavigate()
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

        {tab === 'mios' && (
          <div className="pt-4">
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => setSheetOpen(true)}
            >
              <Headset size={16} weight="duotone" />
              {t('soporte.contactar.cta')}
            </Button>
          </div>
        )}
      </div>

      <ReportarProblemaSheet
        type="support_request"
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={(ticket) => void navigate({ to: '/soporte/tickets/$id', params: { id: ticket.id } })}
      />
    </div>
  )
}
