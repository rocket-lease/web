import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { X as PhosphorX } from '@phosphor-icons/react'
import {
  AlertOctagon,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  LifeBuoy,
  MessageSquare,
  QrCode,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import {
  RESERVATION_STATUS,
  type CancellationPolicy,
  type GetReservationResponse,
  type PaymentMethod,
  type ReservationRuleSetPublic,
} from '@rocket-lease/contracts'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { useConfirmPayment } from '@/features/reservar/hooks/useConfirmPayment'
import { useInitiateTransfer } from '@/features/reservar/hooks/useInitiateTransfer'
import { useCancelReservation } from '@/features/reservar/hooks/useCancelReservation'
import { useUnreadCount } from '@/features/chat/hooks/useUnreadCount'
import { PaymentMethodPicker } from '@/features/reservar/components/PaymentMethodPicker'
import { HoldCountdown } from '@/features/reservar/components/HoldCountdown'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { QrScanner } from '../QrScanner'
import { ReservaStatusBadge } from '../ReservaStatusBadge'
import { ReservaUbicacion } from './ReservaUbicacion'
import { formatApprovalCountdown } from '../../utils/approval-countdown'
import {
  getCancellationRefundSummary,
  getEffectiveReservationRules,
  type EffectiveReservationRules,
} from '../../utils/cancellation-policy'
import { useConfirmReturn } from '../../hooks/useConfirmReturn'

interface ConductorViewProps {
  reservation: GetReservationResponse
}

/**
 * Vista del detalle de una reserva desde la perspectiva del conductor.
 *
 * Renderiza el vehículo, fechas, rentador y total. Según el estado,
 * habilita: voucher QR (`confirmed`/`in_progress`), selección de método
 * de pago y countdown del hold (`pending_payment`), aviso + acción de
 * retirar solicitud (`pending_approval`), o mensaje del rechazo (`rejected`).
 */
export function ConductorView({ reservation }: ConductorViewProps) {
  const {
    vehicle,
    rentador,
    status,
    startAt,
    endAt,
    totalCents,
    paymentMethod,
    holdExpiresAt,
    contractAcceptedAt,
    rejectionReason,
    voucherToken,
  } = reservation
  const showVoucher = status === RESERVATION_STATUS.confirmed
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (showVoucher && voucherToken) {
      const verifyUrl = `${window.location.origin}/voucher/verify/${voucherToken}`
      QRCode.toDataURL(verifyUrl, { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [showVoucher, voucherToken])
  const canPay = status === RESERVATION_STATUS.pending_payment
  const isPendingApproval = status === RESERVATION_STATUS.pending_approval
  const isRejected = status === RESERVATION_STATUS.rejected
  /**
   * Estados donde la reserva sigue "viva" para el conductor: puede ser
   * confirmada y por iniciar (`confirmed`), o ya en uso (`in_progress`).
   * En estos casos el conductor puede ver el contrato y reportar problemas,
   * pero NO cancelar (la api rechaza `cancel` después de `pending_payment`
   * — para cancelar después del pago debe contactar soporte).
   */
  const isPostPayment = status === RESERVATION_STATUS.confirmed || status === RESERVATION_STATUS.in_progress

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {t('reservas.detail.idPrefix')}
          {reservation.id.slice(0, 8)}
        </p>
        <ReservaStatusBadge estado={status} />
      </div>

      <div className="card overflow-hidden">
        {vehicle.photo ? (
          <div className="aspect-video bg-surface-2">
            <img
              src={vehicle.photo}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-surface-2" />
        )}
        <div className="p-4">
          <p className="font-bold text-text-primary">
            {vehicle.brand} {vehicle.model} {vehicle.year || ''}
          </p>
        </div>
      </div>

      <ReservaUbicacion vehicleId={vehicle.id} />

      {showVoucher && voucherToken && (
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <QrCode className="h-4 w-4" />
            {t('reservas.detail.voucher')}
          </div>
          <div className="h-48 w-48 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-white/6 p-2">
            <img
              src={qrDataUrl || ''}
              alt="Voucher QR"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <p className="text-xs text-text-muted text-center max-w-xs">
            {t('reservas.detail.voucherHelp')}
          </p>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {t('reservas.detail.dates')}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-surface-2 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-brand-400" />
              <span className="text-xs text-text-muted">{t('reservas.detail.pickup')}</span>
            </div>
            <p className="font-semibold text-text-primary">{fmt.dateTime(startAt)}</p>
          </div>
          <div className="flex-1 rounded-xl bg-surface-2 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-brand-400" />
              <span className="text-xs text-text-muted">{t('reservas.detail.return')}</span>
            </div>
            <p className="font-semibold text-text-primary">{fmt.dateTime(endAt)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Avatar
          src={rentador.avatarUrl ?? undefined}
          fallback={rentador.name.slice(0, 2).toUpperCase()}
          size="md"
        />
        <div>
          <p className="text-xs text-text-muted">{t('reservas.detail.rentador')}</p>
          <p className="font-semibold text-text-primary">{rentador.name}</p>
        </div>
      </div>

      {paymentMethod && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{t('reservar.paymentMethod')}</p>
            <p className="text-sm text-text-primary">
              {t(`reservar.paymentMethod.${paymentMethod}`)}
            </p>
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <p className="font-semibold text-text-primary">{t('reservas.detail.total')}</p>
        <p className="text-xl font-bold text-brand-400">{fmt.currency(totalCents)}</p>
      </div>

      <CancellationPolicyCard reservation={reservation} />

      {canPay && (
        <PendingPaymentSection
          reservation={reservation}
          holdExpiresAt={holdExpiresAt}
        />
      )}

      {isPendingApproval && (
        <PendingApprovalSection
          reservationId={reservation.id}
          holdExpiresAt={holdExpiresAt}
        />
      )}

      {isRejected && <RejectedSection reason={rejectionReason} />}

      {contractAcceptedAt && <ContractSection acceptedAt={contractAcceptedAt} />}

      {isPostPayment && (
        <PostPaymentActions reservation={reservation} status={status} />
      )}

      {status === RESERVATION_STATUS.in_progress && (
        <ReturnAction reservationId={reservation.id} />
      )}
    </div>
  )
}

interface ContractSectionProps {
  acceptedAt: string
}

/**
 * Acordeón con el contrato firmado y la fecha de aceptación. Visible cuando
 * la reserva ya tuvo aceptación (`contractAcceptedAt`). El texto del template
 * es el mismo que se muestra al conductor durante el flow de creación.
 */
function ContractSection({ acceptedAt }: ContractSectionProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Separator />
      <div className="rounded-xl border border-white/8 bg-surface-2">
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-3 py-3 text-left"
        >
          <FileText className="h-4 w-4 text-brand-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {t('reservas.detail.contract.title')}
            </p>
            <p className="text-xs text-text-muted truncate">
              {t('reservas.detail.contract.acceptedAt').replace(
                '{date}',
                fmt.dateTime(acceptedAt),
              )}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-text-muted shrink-0 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expanded && (
          <div className="px-3 pb-3 -mt-1 text-sm text-text-secondary leading-relaxed">
            {t('reservar.contract.body')}
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Bloque de acciones para reservas activas post-pago (`confirmed` /
 * `in_progress`). En `confirmed` permite cancelar con reembolso real; en
 * `in_progress` solo deja reportar un problema.
 */
function PostPaymentActions({
  reservation,
  status,
}: {
  reservation: GetReservationResponse
  status: GetReservationResponse['status']
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const cancelMutation = useCancelReservation()

  const canCancel = status === RESERVATION_STATUS.confirmed
  const canChat =
    status === RESERVATION_STATUS.confirmed || status === RESERVATION_STATUS.in_progress
  const { data: unreadCount = 0 } = useUnreadCount(reservation.id, canChat)
  const refundPreview = getCancellationRefundPreview(reservation)

  const handleCancel = async () => {
    try {
      const result = await cancelMutation.mutateAsync(reservation.id)
      toast.success(
        result.refundCents > 0
          ? t('reservas.detail.cancel.refund.success').replace('{amount}', fmt.currency(result.refundCents))
          : t('reservas.detail.cancel.success'),
      )
      setShowCancelModal(false)
    } catch {
      toast.error(t('error.default'))
    }
  }

  return (
    <>
      <Separator />
      <div className="space-y-2">
        {canCancel && (
          <Button
            variant="outline"
            className="w-full border-danger/40 text-danger-400 hover:bg-danger/10"
            onClick={() => setShowCancelModal(true)}
            disabled={cancelMutation.isPending}
          >
            <XCircle className="h-4 w-4" />
            {t('reservas.detail.cancel.cta')}
          </Button>
        )}
        <Link
          to="/reservas/$id/chat"
          params={{ id: reservation.id }}
          className="relative flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 active:scale-[0.99] transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          {t('reservas.detail.actions.chat')}
          {unreadCount > 0 && (
            <span className="absolute -top-2.5 right-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white ring-2 ring-white shadow-[0_0_10px_rgba(239,68,68,0.75)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link
          to="/soporte"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-3 active:scale-[0.99] transition-colors"
        >
          <LifeBuoy className="h-4 w-4" />
          {t('reservas.detail.actions.reportar')}
        </Link>
      </div>

      {showCancelModal && (
        <CancelConfirmModal
          submitting={cancelMutation.isPending}
          refundPreview={refundPreview}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </>
  )
}

function CancellationPolicyCard({ reservation }: { reservation: GetReservationResponse }) {
  const summary = getCancellationRefundSummary(reservation)
  const effectiveRules = getEffectiveReservationRules(reservation)

  const deadline = summary.deadlineAt ? fmt.dateTime(summary.deadlineAt) : null
  let refundMessage: string

  switch (summary.state) {
    case 'flexible_active':
      refundMessage = t('reservas.detail.cancellation.refund.flexible.active').replace('{deadline}', deadline ?? '—')
      break
    case 'flexible_expired':
      refundMessage = t('reservas.detail.cancellation.refund.flexible.expired')
      break
    case 'moderate_active':
      refundMessage = t('reservas.detail.cancellation.refund.moderate.active').replace('{deadline}', deadline ?? '—')
      break
    case 'moderate_expired':
      refundMessage = t('reservas.detail.cancellation.refund.moderate.expired')
      break
    case 'strict_active':
      refundMessage = t('reservas.detail.cancellation.refund.strict.active').replace('{deadline}', deadline ?? '—')
      break
    case 'strict_expired':
      refundMessage = t('reservas.detail.cancellation.refund.strict.expired')
      break
    case 'invalid_dates':
      refundMessage = t('reservas.detail.cancellation.refund.invalidDates')
      break
    default:
      refundMessage = t('reservas.detail.cancellation.refund.flexible.expired')
  }

  const rules = getRuleHighlights(effectiveRules, summary.policy)

  return (
    <div className="rounded-xl border border-info/20 bg-info/10 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-info shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-info">
            {t('reservas.detail.cancellation.title')}
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {t('reservas.detail.cancellation.policy')}: {getPolicyLabel(summary.policy)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">{refundMessage}</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface-1/70 px-3 py-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('reservas.detail.cancellation.rulesTitle')}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
          {rules.map((rule) => (
            <li key={rule} className="leading-relaxed">{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function getRuleHighlights(
  rules: EffectiveReservationRules,
  policy: CancellationPolicy | null,
): string[] {
  const lines = [
    t('reservas.detail.cancellation.rules.policy').replace('{value}', getPolicyLabel(policy)),
    t('reservas.detail.cancellation.rules.deposit').replace('{value}', getDepositLabel(rules.depositPercentage)),
    t('reservas.detail.cancellation.rules.kilometrage').replace('{value}', getKilometrageLabel(rules)),
  ]

  const rentalTime = getRentalTimeLabel(rules)
  if (rentalTime) {
    lines.push(t('reservas.detail.cancellation.rules.rentalTime').replace('{value}', rentalTime))
  }

  return lines
}

function getPolicyLabel(policy: ReservationRuleSetPublic['cancellationPolicy'] | null): string {
  if (policy === 'FLEXIBLE') return t('reservas.detail.cancellation.policy.flexible')
  if (policy === 'MODERATE') return t('reservas.detail.cancellation.policy.moderate')
  if (policy === 'STRICT') return t('reservas.detail.cancellation.policy.strict')
  return t('reservas.detail.cancellation.policy.unknown')
}

function getDepositLabel(depositPercentage: number | null): string {
  if (depositPercentage === null) return t('reservas.detail.cancellation.deposit.none')
  return `${depositPercentage}% de seña`
}

function getKilometrageLabel(rules: EffectiveReservationRules): string {
  if (rules.maxKilometrage.type === 'UNLIMITED') {
    return t('reservas.detail.cancellation.kilometrage.unlimited')
  }
  return t('reservas.detail.cancellation.kilometrage.limited').replace(
    '{value}',
    String(rules.maxKilometrage.value),
  )
}

function getRentalTimeLabel(rules: EffectiveReservationRules): string | null {
  const minDays = rules.rentalTimeConstraints.minDays
  const maxDays = rules.rentalTimeConstraints.maxDays

  if (minDays && maxDays) {
    return t('reservas.detail.cancellation.rentalTime.between')
      .replace('{min}', String(minDays))
      .replace('{max}', String(maxDays))
  }
  if (minDays) {
    return t('reservas.detail.cancellation.rentalTime.min').replace('{min}', String(minDays))
  }
  if (maxDays) {
    return t('reservas.detail.cancellation.rentalTime.max').replace('{max}', String(maxDays))
  }
  return null
}

interface PendingApprovalSectionProps {
  reservationId: string
  holdExpiresAt: string | null
}

/**
 * Bloque visible cuando la solicitud del conductor está en `pending_approval`:
 * countdown del TTL de 24h + CTA "Retirar solicitud" que abre un modal
 * anti-misclick estilo Airbnb (botón principal es "Volver").
 */
function PendingApprovalSection({ reservationId, holdExpiresAt }: PendingApprovalSectionProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const cancelMutation = useCancelReservation()

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const countdown = formatApprovalCountdown(holdExpiresAt, now)

  const handleWithdraw = async () => {
    try {
      await cancelMutation.mutateAsync(reservationId)
      toast.success(t('conductor.reservas.retirar.success'))
      setShowWithdrawModal(false)
    } catch {
      toast.error(t('error.default'))
    }
  }

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 p-3 flex gap-3">
          <Inbox className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {t('conductor.reservas.tituloEnRevision')}
            </p>
            {countdown && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-1 px-2.5 py-1 text-xs font-medium text-brand-400">
                <Clock className="h-3.5 w-3.5" />
                {countdown}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full text-danger-400 hover:bg-danger/10"
          onClick={() => setShowWithdrawModal(true)}
          disabled={cancelMutation.isPending}
        >
          {t('conductor.reservas.retirar.cta')}
        </Button>
      </div>

      {showWithdrawModal && (
        <WithdrawConfirmModal
          submitting={cancelMutation.isPending}
          onConfirm={handleWithdraw}
          onCancel={() => setShowWithdrawModal(false)}
        />
      )}
    </>
  )
}

interface WithdrawConfirmModalProps {
  submitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function WithdrawConfirmModal({ submitting, onConfirm, onCancel }: WithdrawConfirmModalProps) {
  useLockBodyScroll()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-white/8 p-6 shadow-elevated my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-text-primary">
          {t('conductor.reservas.retirar.modalTitle')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('conductor.reservas.retirar.modalBody')}
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="text-danger-400"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting
              ? t('conductor.reservas.retirar.retirando')
              : t('conductor.reservas.retirar.confirmar')}
          </Button>
          <Button onClick={onCancel} disabled={submitting}>
            {t('conductor.reservas.retirar.cancelar')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RejectedSection({ reason }: { reason: string | null }) {
  const display = reason && reason.trim().length > 0
    ? reason
    : t('conductor.reservas.rechazoGenerico')
  return (
    <>
      <Separator />
      <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 flex gap-3">
        <AlertOctagon className="h-4 w-4 text-danger-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-danger-400 uppercase tracking-wider">
            {t('conductor.reservas.rechazoTitulo')}
          </p>
          <p className="mt-1 text-sm text-text-secondary wrap-break-word">{display}</p>
        </div>
      </div>
    </>
  )
}

interface PendingPaymentSectionProps {
  reservation: GetReservationResponse
  holdExpiresAt: string | null
}

function PendingPaymentSection({ reservation, holdExpiresAt }: PendingPaymentSectionProps) {
  const reservationId = reservation.id
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [holdExpired, setHoldExpired] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const confirmPayment = useConfirmPayment(reservationId)
  const initiateTransfer = useInitiateTransfer(reservationId)
  const cancelMutation = useCancelReservation()
  const navigate = useNavigate()
  const refundPreview = getCancellationRefundPreview(reservation)

  /**
   * Dispara la mutación de pago y traga la excepción. El error queda
   * disponible vía `confirmPayment.error` y se renderiza inline abajo.
   */
  const onPay = async () => {
    if (!method) return
    try {
      if (method === 'bank_transfer') {
        await initiateTransfer.mutateAsync()
        navigate({
          to: '/reservas-transferencia/$id',
          params: { id: reservationId },
        })
      } else {
        await confirmPayment.mutateAsync({ paymentMethod: method })
      }
    } catch {
      /* error rendered via confirmPayment.error or initiateTransfer.error */
    }
  }

  const onCancel = async () => {
    try {
      const result = await cancelMutation.mutateAsync(reservationId)
      toast.success(
        result.refundCents > 0
          ? t('reservas.detail.cancel.refund.success').replace('{amount}', fmt.currency(result.refundCents))
          : t('reservas.detail.cancel.success'),
      )
      setShowCancelModal(false)
    } catch {
      toast.error(t('error.default'))
    }
  }

  const isPending = confirmPayment.isPending || initiateTransfer.isPending

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {t('reservar.paymentMethod')}
        </p>
        <PaymentMethodPicker
          value={method}
          onChange={setMethod}
          disabled={isPending || holdExpired}
        />
        {holdExpiresAt && !holdExpired && (
          <HoldCountdown
            expiresAt={holdExpiresAt}
            onExpire={() => setHoldExpired(true)}
          />
        )}
        {(confirmPayment.error || initiateTransfer.error) && (
          <p className="text-sm text-danger">{t('reservar.errors.generic')}</p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={!method || isPending || holdExpired}
          onClick={onPay}
        >
          {isPending ? (
            t('general.loading')
          ) : (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('reservar.payAndConfirm')}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full text-danger-400 hover:bg-danger/10"
          onClick={() => setShowCancelModal(true)}
          disabled={cancelMutation.isPending}
        >
          <XCircle className="h-4 w-4" />
          {t('reservas.detail.cancel.cta')}
        </Button>
        <Link
          to="/soporte"
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary py-2"
        >
          <LifeBuoy className="h-4 w-4" />
          {t('reservas.detail.actions.reportar')}
        </Link>
      </div>

      {showCancelModal && (
        <CancelConfirmModal
          submitting={cancelMutation.isPending}
          refundPreview={refundPreview}
          onConfirm={onCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </>
  )
}

interface CancelConfirmModalProps {
  submitting: boolean
  refundPreview: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal anti-misclick para cancelar una reserva. El botón principal es
 * "Volver" (no cancelar) para evitar cancelaciones accidentales por tap rápido.
 */
function CancelConfirmModal({ submitting, refundPreview, onConfirm, onCancel }: CancelConfirmModalProps) {
  useLockBodyScroll()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-white/8 p-6 shadow-elevated my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-text-primary">
          {t('reservas.detail.cancel.modalTitle')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('reservas.detail.cancel.modalBody')}
        </p>
        <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-text-primary">
          {refundPreview}
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="text-danger-400"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting
              ? t('reservas.detail.cancel.canceling')
              : t('reservas.detail.cancel.confirm')}
          </Button>
          <Button onClick={onCancel} disabled={submitting}>
            {t('reservas.detail.cancel.back')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function getCancellationRefundPreview(reservation: GetReservationResponse): string {
  const summary = getCancellationRefundSummary(reservation)

  if (summary.refundCents > 0) {
    return t('reservas.detail.cancel.refund.preview').replace('{amount}', fmt.currency(summary.refundCents))
  }

  if (summary.state === 'invalid_dates') {
    return t('reservas.detail.cancel.refund.unknown')
  }

  return t('reservas.detail.cancel.noRefund.preview')
}

function ReturnAction({ reservationId }: { reservationId: string }) {
  const [showScanner, setShowScanner] = useState(false)
  const confirmReturn = useConfirmReturn(reservationId)

  const handleScan = async (token: string) => {
    try {
      await confirmReturn.mutateAsync(token)
      toast.success(t('reservas.devolucion.exito'))
      setShowScanner(false)
    } catch {
      toast.error(t('reservas.devolucion.qrInvalido'))
    }
  }

  return (
    <>
      <Separator />
      <Button className="w-full rounded-full" onClick={() => setShowScanner(true)}>
        {t('reservas.devolucion.cta')}
      </Button>

      {showScanner && (
        <ReturnScannerModal
          submitting={confirmReturn.isPending}
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}

interface ReturnScannerModalProps {
  submitting: boolean
  onScan: (token: string) => void
  onClose: () => void
}

function ReturnScannerModal({ submitting, onScan, onClose }: ReturnScannerModalProps) {
  useLockBodyScroll()
  return (
    <>
      <div
        className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-61 rounded-t-2xl bg-surface-1 border-t border-white/8 p-5 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-text-primary">{t('reservas.devolucion.scannerTitle')}</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
            aria-label={t('reservas.qr.cancelar')}
          >
            <PhosphorX className="h-4 w-4" weight="bold" />
          </button>
        </div>
        {submitting ? (
          <p className="text-center text-text-muted py-8">{t('reservas.devolucion.confirmando')}</p>
        ) : (
          <QrScanner
            onScan={onScan}
            confirmLabel={t('reservas.devolucion.confirmar')}
            fallbackLabel={t('reservas.retiro.fallback')}
          />
        )}
      </div>
    </>
  )
}
