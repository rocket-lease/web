import { useState } from 'react'
import { PageLoader } from '@/ui/page-loader'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle, ShieldCheck, WarningCircle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTicket } from '@/features/soporte/hooks/useTicket'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import type { TicketStatus, TicketType } from '@rocket-lease/contracts'
import { useAdminUpdateStatus } from '../hooks/useAdminUpdateStatus'
import { ResolveIncidentModal } from './ResolveIncidentModal'
import { AdminUserChip } from './AdminUserChip'
import { AdminReservationCard } from './AdminReservationCard'
import { TicketChatSection } from '@/features/soporte/components/TicketChatSection'

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  closed: 'bg-surface-3 text-text-muted border-white/10',
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: t('admin.tickets.badge.open'),
  under_review: t('admin.tickets.badge.under_review'),
  resolved: t('admin.tickets.badge.resolved'),
  closed: t('admin.tickets.badge.closed'),
}

const TYPE_LABELS: Record<TicketType, 'tickets.tipo.vehicle_issue' | 'tickets.tipo.counterpart_report' | 'tickets.tipo.support_request'> = {
  vehicle_issue: 'tickets.tipo.vehicle_issue',
  counterpart_report: 'tickets.tipo.counterpart_report',
  support_request: 'tickets.tipo.support_request',
}

export function AdminTicketDetailPage({ ticketId }: { ticketId: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const markUnderReview = useAdminUpdateStatus(ticketId)
  const [showResolveModal, setShowResolveModal] = useState(false)

  const isClosed = ticket?.status === 'resolved' || ticket?.status === 'closed'
  const canMarkUnderReview = ticket?.status === 'open'
  const canResolve = ticket?.status === 'open' || ticket?.status === 'under_review'

  async function handleMarkUnderReview() {
    try {
      await markUnderReview.mutateAsync()
      toast.success('Ticket marcado en revisión.')
    } catch {
      toast.error('No se pudo cambiar el estado.')
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <header
        className="flex items-center gap-3 px-4 py-4 border-b border-white/6 bg-surface-0 sticky top-0 z-10 shrink-0"
      >
        <button
          onClick={() => void navigate({ to: '/tickets' })}
          aria-label={t('general.back')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-secondary hover:text-text-primary transition-colors shrink-0 active:scale-[0.97]"
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-xl font-bold leading-tight text-text-primary truncate">
            {t('tickets.detail.title')}
          </h1>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5">
            <ShieldCheck size={12} weight="duotone" className="text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-10">
        {isLoading && (
          <PageLoader />
        )}

        {ticket && (
          <>
            {/* Info card */}
            <div className="rounded-2xl bg-surface-1 border border-white/6 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-text-muted">
                    {t(TYPE_LABELS[ticket.type])}
                  </p>
                  <p className="font-semibold text-text-primary">
                    {ticket.subject || ticket.description}
                  </p>
                </div>
                <Badge className={STATUS_STYLES[ticket.status]}>
                  {STATUS_LABELS[ticket.status]}
                </Badge>
              </div>

              <p className="text-sm text-text-secondary">{ticket.description}</p>

              {ticket.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ticket.photoUrls.map((url) => (
                    <img key={url} src={url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ))}
                </div>
              )}

              <p className="text-xs text-text-muted">{fmt.dateShort(ticket.createdAt)}</p>
            </div>

            {/* Reservation card */}
            {ticket.reservationId && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted px-1">{t('admin.tickets.reservaAsociada')}</p>
                <AdminReservationCard reservationId={ticket.reservationId} />
              </div>
            )}

            {/* Admin action buttons */}
            {(canMarkUnderReview || canResolve) && (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-400">{t('admin.tickets.acciones')}</p>
                <div className="flex flex-wrap gap-2">
                  {canMarkUnderReview && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="border-warning/40 text-warning gap-1.5"
                      disabled={markUnderReview.isPending}
                      onClick={() => void handleMarkUnderReview()}
                    >
                      <CheckCircle size={14} weight="duotone" />
                      {markUnderReview.isPending ? 'Actualizando...' : t('admin.tickets.markUnderReview')}
                    </Button>
                  )}
                  {canResolve && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="border-success/40 text-success gap-1.5"
                      onClick={() => setShowResolveModal(true)}
                    >
                      <WarningCircle size={14} weight="duotone" />
                      {t('admin.tickets.resolveIncident')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Chats */}
            {user && ticket.conductorId && ticket.rentadorId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <AdminUserChip userId={ticket.conductorId} role="conductor" />
                  <TicketChatSection
                    ticketId={ticketId}
                    currentUserId={user.id}
                    channelParticipantId={ticket.conductorId}
                    isClosed={isClosed}
                    label={t('admin.chat.canalConductor')}
                    accentClass="rounded-br-sm bg-amber-500 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <AdminUserChip userId={ticket.rentadorId} role="rentador" />
                  <TicketChatSection
                    ticketId={ticketId}
                    currentUserId={user.id}
                    channelParticipantId={ticket.rentadorId}
                    isClosed={isClosed}
                    label={t('admin.chat.canalRentador')}
                    accentClass="rounded-br-sm bg-amber-500 text-black"
                  />
                </div>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <AdminUserChip
                  userId={ticket.reporterId}
                  role={ticket.reportedBy ?? 'conductor'}
                />
                <TicketChatSection
                  ticketId={ticketId}
                  currentUserId={user.id}
                  channelParticipantId={ticket.reporterId}
                  isClosed={isClosed}
                  accentClass="rounded-br-sm bg-amber-500 text-black"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {ticket && (
        <ResolveIncidentModal
          open={showResolveModal}
          onClose={() => setShowResolveModal(false)}
          ticket={ticket}
        />
      )}
    </div>
  )
}
