import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertOctagon, CalendarDays, CheckCircle2, Clock, Inbox, QrCode } from 'lucide-react'
import type { GetReservationResponse, PaymentMethod } from '@rocket-lease/contracts'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { useConfirmPayment } from '@/features/reservar/hooks/useConfirmPayment'
import { useCancelReservation } from '@/features/reservar/hooks/useCancelReservation'
import { PaymentMethodPicker } from '@/features/reservar/components/PaymentMethodPicker'
import { HoldCountdown } from '@/features/reservar/components/HoldCountdown'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { ReservaStatusBadge } from '../ReservaStatusBadge'
import { formatApprovalCountdown } from '../../utils/approval-countdown'

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
    rejectionReason,
  } = reservation
  const showVoucher = status === 'confirmed' || status === 'in_progress'
  const canPay = status === 'pending_payment'
  const isPendingApproval = status === 'pending_approval'
  const isRejected = status === 'rejected'

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

      {showVoucher && (
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <QrCode className="h-4 w-4" />
            {t('reservas.detail.voucher')}
          </div>
          <div className="h-48 w-48 rounded-2xl bg-surface-2 flex items-center justify-center border border-white/6">
            <QrCode className="h-20 w-20 text-text-muted" />
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

      {canPay && (
        <PendingPaymentSection
          reservationId={reservation.id}
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
    </div>
  )
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
          <p className="mt-1 text-sm text-text-secondary break-words">{display}</p>
        </div>
      </div>
    </>
  )
}

interface PendingPaymentSectionProps {
  reservationId: string
  holdExpiresAt: string | null
}

function PendingPaymentSection({ reservationId, holdExpiresAt }: PendingPaymentSectionProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [holdExpired, setHoldExpired] = useState(false)
  const confirmPayment = useConfirmPayment(reservationId)

  /**
   * Dispara la mutación de pago y traga la excepción. El error queda
   * disponible vía `confirmPayment.error` y se renderiza inline abajo.
   */
  const onPay = async () => {
    if (!method) return
    try {
      await confirmPayment.mutateAsync({ paymentMethod: method })
    } catch {
      /* error rendered via confirmPayment.error */
    }
  }

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
          disabled={confirmPayment.isPending || holdExpired}
        />
        {holdExpiresAt && !holdExpired && (
          <HoldCountdown
            expiresAt={holdExpiresAt}
            onExpire={() => setHoldExpired(true)}
          />
        )}
        {confirmPayment.error && (
          <p className="text-sm text-danger">{t('reservar.errors.generic')}</p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={!method || confirmPayment.isPending || holdExpired}
          onClick={onPay}
        >
          {confirmPayment.isPending ? (
            t('general.loading')
          ) : (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('reservar.payAndConfirm')}
            </span>
          )}
        </Button>
      </div>
    </>
  )
}
