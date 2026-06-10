import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Gavel, ShieldCheck } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTicket } from '@/features/soporte/hooks/useTicket'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import type { TicketStatus, TicketType } from '@rocket-lease/contracts'
import { useAdminUpdateStatus } from '../hooks/useAdminUpdateStatus'
import { useDisputeActions } from '../hooks/useDisputeActions'
import { useTicketDispute } from '../hooks/useTicketDispute'
import { DisputePanel } from './DisputePanel'
import { TicketChatSection } from '@/features/soporte/components/TicketChatSection'

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  rejected: 'bg-danger text-white border-danger',
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: t('admin.tickets.badge.open'),
  under_review: t('admin.tickets.badge.under_review'),
  resolved: t('admin.tickets.badge.resolved'),
  rejected: t('admin.tickets.badge.rejected'),
}

const TYPE_LABELS: Record<TicketType, 'tickets.tipo.vehicle_issue' | 'tickets.tipo.counterpart_report' | 'tickets.tipo.support_request'> = {
  vehicle_issue: 'tickets.tipo.vehicle_issue',
  counterpart_report: 'tickets.tipo.counterpart_report',
  support_request: 'tickets.tipo.support_request',
}

const NEXT_STATUSES: Record<TicketStatus, TicketStatus[]> = {
  open: ['under_review', 'resolved', 'rejected'],
  under_review: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
}

const STATUS_ACTION_LABELS: Record<TicketStatus, string> = {
  open: t('admin.tickets.badge.open'),
  under_review: 'Tomar → En revisión',
  resolved: 'Cerrar → Resuelto',
  rejected: 'Cerrar → Rechazado',
}

const COMPENSATION_STATUSES = new Set<TicketStatus>(['resolved', 'rejected'])

export function AdminTicketDetailPage({ ticketId }: { ticketId: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const updateStatus = useAdminUpdateStatus(ticketId)
  const { escalate } = useDisputeActions(ticketId)
  const { data: dispute } = useTicketDispute(ticketId)

  // Compensation form state (for status changes to resolved/rejected)
  type AdminStatus = 'under_review' | 'resolved' | 'rejected'

  const [pendingStatus, setPendingStatus] = useState<AdminStatus | null>(null)
  const [compResponsibleId, setCompResponsibleId] = useState('')
  const [compAmount, setCompAmount] = useState('')

  function handleStatusClick(status: TicketStatus) {
    if (COMPENSATION_STATUSES.has(status)) {
      setPendingStatus(status as AdminStatus)
    } else {
      void confirmStatusChange(status as AdminStatus)
    }
  }

  async function confirmStatusChange(status: AdminStatus, compensation?: { responsibleUserId: string; amountCents: number }) {
    try {
      await updateStatus.mutateAsync({ status, compensation })
      toast.success(`Estado actualizado a: ${STATUS_LABELS[status]}`)
      setPendingStatus(null)
      setCompResponsibleId('')
      setCompAmount('')
    } catch {
      toast.error('No se pudo cambiar el estado.')
    }
  }

  async function handleConfirmWithCompensation() {
    if (!pendingStatus) return
    const hasComp = compResponsibleId.trim() && compAmount
    const compensation = hasComp
      ? { responsibleUserId: compResponsibleId.trim(), amountCents: Math.round(parseFloat(compAmount) * 100) }
      : undefined
    await confirmStatusChange(pendingStatus, compensation)
  }

  async function handleEscalate() {
    try {
      await escalate.mutateAsync()
      toast.success('Ticket escalado a disputa.')
    } catch {
      toast.error('No se pudo escalar a disputa.')
    }
  }

  const canChangeStatus = ticket && NEXT_STATUSES[ticket.status].length > 0
  const canEscalate =
    ticket?.type === 'counterpart_report' &&
    (ticket.status === 'open' || ticket.status === 'under_review') &&
    !dispute &&
    !escalate.isPending

  return (
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <header
        className="flex items-center gap-3 px-4 py-4 border-b border-white/6 bg-surface-0 sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
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

      <div className="flex-1 px-4 py-4 space-y-5 pb-10">
        {isLoading && (
          <p className="text-center text-sm text-text-muted py-12">{t('general.loading')}</p>
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

              {ticket.reservationId && (
                <p className="text-xs text-text-muted font-mono">
                  Reserva: #{ticket.reservationId.slice(0, 8)}
                </p>
              )}

              {ticket.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ticket.photoUrls.map((url) => (
                    <img key={url} src={url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ))}
                </div>
              )}

              <p className="text-xs text-text-muted">{fmt.dateShort(ticket.createdAt)}</p>
            </div>

            {/* Marcar como disputa */}
            {canEscalate && (
              <Button
                variant="secondary"
                className="w-full border-amber-500/30 text-amber-400 gap-2"
                onClick={() => void handleEscalate()}
                disabled={escalate.isPending}
              >
                <Gavel size={15} weight="duotone" />
                {escalate.isPending ? 'Escalando...' : t('admin.tickets.marcarDisputa')}
              </Button>
            )}

            {/* DisputePanel */}
            {dispute && (
              <DisputePanel
                ticketId={ticketId}
                dispute={dispute}
                ticketStatus={ticket.status}
                conductorId={dispute.conductorId}
                rentadorId={dispute.rentadorId}
              />
            )}

            {/* Admin status controls */}
            {canChangeStatus && !pendingStatus && (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-400">Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUSES[ticket.status].map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      size="sm"
                      variant="secondary"
                      disabled={updateStatus.isPending}
                      onClick={() => handleStatusClick(nextStatus)}
                      className={`text-xs ${nextStatus === 'resolved' ? 'border-success/40 text-success' : nextStatus === 'rejected' ? 'border-danger/40 text-danger' : 'border-warning/40 text-warning'}`}
                    >
                      {STATUS_ACTION_LABELS[nextStatus]}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Compensation form */}
            {pendingStatus && (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-4">
                <p className="text-sm font-semibold text-amber-400">
                  Cerrar ticket como: <span className={pendingStatus === 'resolved' ? 'text-success' : 'text-danger'}>{STATUS_LABELS[pendingStatus]}</span>
                </p>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-text-secondary">Compensación (opcional)</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-text-muted">ID del responsable</p>
                  <input
                    type="text"
                    value={compResponsibleId}
                    onChange={(e) => setCompResponsibleId(e.target.value)}
                    placeholder="UUID del usuario responsable"
                    className="w-full rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-text-muted">Monto de compensación (ARS, opcional)</p>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={compAmount}
                    onChange={(e) => setCompAmount(e.target.value)}
                    placeholder="Ej: 5000.00"
                    className="w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => { setPendingStatus(null); setCompResponsibleId(''); setCompAmount('') }}
                  >
                    {t('general.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 text-xs ${pendingStatus === 'resolved' ? 'bg-success text-white hover:bg-success/90' : 'bg-danger text-white hover:bg-danger/90'}`}
                    disabled={updateStatus.isPending}
                    onClick={() => void handleConfirmWithCompensation()}
                  >
                    {updateStatus.isPending ? 'Guardando...' : 'Confirmar cierre'}
                  </Button>
                </div>
              </div>
            )}

            {/* Chats */}
            {user && ticket.conductorId && ticket.rentadorId ? (
              <div className="space-y-4">
                <TicketChatSection
                  ticketId={ticketId}
                  currentUserId={user.id}
                  channelParticipantId={ticket.conductorId}
                  isClosed={ticket.status === 'resolved' || ticket.status === 'rejected'}
                  label={t('admin.chat.canalConductor')}
                  accentClass="rounded-br-sm bg-amber-500 text-black"
                />
                <TicketChatSection
                  ticketId={ticketId}
                  currentUserId={user.id}
                  channelParticipantId={ticket.rentadorId}
                  isClosed={ticket.status === 'resolved' || ticket.status === 'rejected'}
                  label={t('admin.chat.canalRentador')}
                  accentClass="rounded-br-sm bg-amber-500 text-black"
                />
              </div>
            ) : user ? (
              <TicketChatSection
                ticketId={ticketId}
                currentUserId={user.id}
                channelParticipantId={ticket.reporterId}
                isClosed={ticket.status === 'resolved' || ticket.status === 'rejected'}
                accentClass="rounded-br-sm bg-amber-500 text-black"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
