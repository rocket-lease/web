import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import type { TicketStatus, TicketType } from '@rocket-lease/contracts'
import { useTicket } from '../hooks/useTicket'
import { useRateTicket } from '../hooks/useRateTicket'
import { useAppealDispute } from '../hooks/useAppealDispute'
import { RatingStars } from './RatingStars'
import { TicketChatSection } from './TicketChatSection'

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  rejected: 'bg-danger text-white border-danger',
}

const statusLabels: Record<TicketStatus, string> = {
  open: 'tickets.status.open',
  under_review: 'tickets.status.under_review',
  resolved: 'tickets.status.resolved',
  rejected: 'tickets.status.rejected',
}

const typeLabels: Record<TicketType, string> = {
  vehicle_issue: 'tickets.tipo.vehicle_issue',
  counterpart_report: 'tickets.tipo.counterpart_report',
  support_request: 'tickets.tipo.support_request',
}

const RATEABLE_STATUSES = new Set<TicketStatus>(['resolved', 'rejected'])

interface TicketDetailPageProps {
  ticketId: string
}

export function TicketDetailPage({ ticketId }: TicketDetailPageProps) {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const navigate = useNavigate()
  const rateTicket = useRateTicket(ticketId)
  const [pendingRating, setPendingRating] = useState<number | null>(null)

  const appealDispute = useAppealDispute(ticketId)
  const [appealReason, setAppealReason] = useState('')
  const [showAppealForm, setShowAppealForm] = useState(false)

  async function handleRate() {
    if (pendingRating === null) return
    try {
      await rateTicket.mutateAsync(pendingRating)
      toast.success(t('tickets.detail.rating.sent'))
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'TICKET_RATING_NOT_ALLOWED') toast.error(t('tickets.detail.rating.notAllowed'))
      else if (code === 'TICKET_ALREADY_RATED') toast.error(t('tickets.detail.rating.alreadyRated'))
      else toast.error(t('tickets.detail.rating.error'))
    }
  }

  async function handleAppeal() {
    if (!appealReason.trim() || appealDispute.isPending) return
    try {
      await appealDispute.mutateAsync(appealReason.trim())
      toast.success(t('dispute.appeal.success'))
      setShowAppealForm(false)
      setAppealReason('')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'DISPUTE_APPEAL_LIMIT_REACHED') toast.error(t('dispute.appeal.limitReached'))
      else toast.error(t('dispute.appeal.error'))
    }
  }

  function handleBack() {
    void navigate({ to: '/soporte' })
  }

  const canRate =
    ticket !== null &&
    ticket !== undefined &&
    RATEABLE_STATUSES.has(ticket.status) &&
    ticket.rating === null &&
    ticket.reporterId === user?.id

  const hasDispute = ticket?.status === 'under_review'
  const canAppeal = hasDispute && ticket?.reporterId === user?.id

  return (
    <div className="flex flex-col min-h-full">
      <header
        className="flex items-center gap-3 px-4 py-4 border-b border-white/6 bg-surface-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <button
          onClick={handleBack}
          aria-label={t('general.back')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-secondary hover:text-text-primary transition-colors shrink-0 active:scale-[0.97]"
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <h1 className="text-xl font-bold leading-tight text-text-primary truncate">
          {t('tickets.detail.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 py-4 space-y-5 pb-24">
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
                    {t(typeLabels[ticket.type] as Parameters<typeof t>[0])}
                  </p>
                  <p className="font-semibold text-text-primary">{ticket.subject}</p>
                </div>
                <Badge className={statusStyles[ticket.status]}>
                  {t(statusLabels[ticket.status] as Parameters<typeof t>[0])}
                </Badge>
              </div>

              <p className="text-sm text-text-secondary">{ticket.description}</p>

              {ticket.reservationId ? (
                <p className="text-xs text-text-muted">
                  {t('tickets.detail.reserva')}{' '}
                  <Link
                    to="/reservas/$id"
                    params={{ id: ticket.reservationId }}
                    className="text-brand-400 underline"
                  >
                    #{ticket.reservationId.slice(0, 8)}
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-text-muted">{t('tickets.detail.noReserva')}</p>
              )}

              {ticket.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ticket.photoUrls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              {ticket.type === 'support_request' && ticket.status === 'open' && (
                <p className="text-xs text-brand-400">{t('tickets.detail.tiempoEstimado')}</p>
              )}

              <p className="text-xs text-text-muted">{fmt.dateShort(ticket.createdAt)}</p>
            </div>

            {/* Rating section */}
            {canRate && (
              <div className="rounded-2xl bg-surface-1 border border-white/6 p-4 space-y-3">
                <p className="font-semibold text-text-primary text-sm">
                  {t('tickets.detail.rating.title')}
                </p>
                <RatingStars
                  value={pendingRating}
                  onChange={setPendingRating}
                />
                <Button
                  disabled={pendingRating === null || rateTicket.isPending}
                  onClick={handleRate}
                  className="w-full"
                >
                  {rateTicket.isPending
                    ? t('tickets.detail.rating.sending')
                    : t('tickets.detail.rating.cta')}
                </Button>
              </div>
            )}

            {ticket.rating !== null && (
              <div className="rounded-2xl bg-surface-1 border border-white/6 p-4 space-y-2">
                <p className="text-sm text-text-muted">{t('tickets.detail.rating.sent')}</p>
                <RatingStars value={ticket.rating} readonly />
              </div>
            )}

            {/* Appeal section — shown when ticket is under_review (dispute active) */}
            {canAppeal && (
              <div className="rounded-2xl bg-surface-1 border border-white/6 p-4 space-y-3">
                <p className="font-semibold text-text-primary text-sm">
                  {t('dispute.section.title')}
                </p>
                {!showAppealForm ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowAppealForm(true)}
                  >
                    {t('dispute.appeal.cta')}
                  </Button>
                ) : (
                  <>
                    <textarea
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder={t('dispute.appeal.reasonPlaceholder')}
                      rows={3}
                      maxLength={1000}
                      className="w-full resize-none rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => { setShowAppealForm(false); setAppealReason('') }}
                      >
                        {t('general.cancel')}
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!appealReason.trim() || appealDispute.isPending}
                        onClick={handleAppeal}
                      >
                        {appealDispute.isPending
                          ? t('dispute.appeal.sending')
                          : t('dispute.appeal.cta')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {user && (
              <TicketChatSection
                ticketId={ticketId}
                currentUserId={user.id}
                channelParticipantId={user.id}
                isClosed={ticket.status === 'resolved' || ticket.status === 'rejected'}
              />
            )}
          </>
        )}

        {/* Admin-only quick status hint */}
        {profile?.isAdmin && ticket && (
          <p className="text-xs text-text-muted text-center">
            Admin · {t(statusLabels[ticket.status] as Parameters<typeof t>[0])}
          </p>
        )}
      </div>
    </div>
  )
}
