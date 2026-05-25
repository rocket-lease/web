import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X as PhosphorX } from '@phosphor-icons/react'
import { AlertOctagon, CalendarDays, Check, ChevronRight, MessageSquare, User, X } from 'lucide-react'
import { RESERVATION_STATUS, type GetReservationResponse } from '@rocket-lease/contracts'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { Skeleton } from '@/ui/skeleton'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { profileApi } from '@/features/perfil/api/profile.api'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { QrScanner } from '../QrScanner'
import { ReservaStatusBadge } from '../ReservaStatusBadge'
import { ReservaUbicacion } from './ReservaUbicacion'
import { useApproveReservation } from '../../hooks/useApproveReservation'
import { useRejectReservation } from '../../hooks/useRejectReservation'
import { useConfirmPickup } from '../../hooks/useConfirmPickup'
import { useUnreadCount } from '@/features/chat/hooks/useUnreadCount'

interface RentadorViewProps {
  reservation: GetReservationResponse
}

/**
 * Vista del detalle de una reserva desde la perspectiva del rentador.
 *
 * Renderiza el vehículo, fechas, conductor (fetcheado aparte porque
 * `GetReservationResponse` solo trae `conductorId`) y total. Sobre
 * solicitudes `pending_approval` habilita aprobar (con modal de confirmación)
 * y rechazar (con razón opcional).
 */
export function RentadorView({ reservation }: RentadorViewProps) {
  const conductorQuery = useQuery({
    queryKey: ['profile', reservation.conductorId],
    queryFn: () => profileApi.getProfileById(reservation.conductorId),
    staleTime: 60_000,
  })
  const conductor = conductorQuery.data

  const canChat =
    reservation.status === RESERVATION_STATUS.confirmed ||
    reservation.status === RESERVATION_STATUS.in_progress
  const { data: unreadCount = 0 } = useUnreadCount(reservation.id, canChat)

  const photo = reservation.vehicle.photo

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {t('reservas.detail.idPrefix')}
          {reservation.id.slice(0, 8)}
        </p>
        <ReservaStatusBadge estado={reservation.status} />
      </div>

      <div className="card overflow-hidden">
        {photo && (
          <div className="aspect-video bg-surface-2">
            <img
              src={photo}
              alt={reservation.vehicle.brand}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <p className="font-bold text-text-primary">
            {reservation.vehicle.brand} {reservation.vehicle.model}{' '}
            {reservation.vehicle.year}
          </p>
        </div>
      </div>

      <ReservaUbicacion vehicleId={reservation.vehicle.id} />

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {t('rentador.reservas.detalle.fechas')}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-surface-2 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-brand-400" />
              <span className="text-xs text-text-muted">
                {t('rentador.reservas.detalle.desde')}
              </span>
            </div>
            <p className="font-semibold text-text-primary">
              {fmt.dateTime(reservation.startAt)}
            </p>
          </div>
          <div className="flex-1 rounded-xl bg-surface-2 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-brand-400" />
              <span className="text-xs text-text-muted">
                {t('rentador.reservas.detalle.hasta')}
              </span>
            </div>
            <p className="font-semibold text-text-primary">
              {fmt.dateTime(reservation.endAt)}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {conductor ? (
        <Link
          to="/perfil/$id"
          params={{ id: conductor.id }}
          aria-label={`Ver perfil de ${conductor.name}`}
          className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-xl hover:bg-surface-2 transition-colors active:scale-[0.99]"
        >
          {conductor.avatarUrl ? (
            <Avatar
              src={conductor.avatarUrl}
              fallback={conductor.name.slice(0, 2).toUpperCase()}
              size="md"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center">
              <User className="h-5 w-5 text-text-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted">
              {t('rentador.reservas.detalle.conductor')}
            </p>
            <p className="font-semibold text-text-primary truncate">
              {conductor.name}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-text-muted shrink-0" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 -mx-2 px-2 py-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <p className="font-semibold text-text-primary">
          {t('rentador.reservas.detalle.total')}
        </p>
        <p className="text-xl font-bold text-brand-400">
          {fmt.currency(reservation.totalCents)}
        </p>
      </div>

      {reservation.paidAt && reservation.paymentMethod && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-text-muted">
            {t('rentador.reservas.detalle.pago')}
          </p>
          <p className="text-text-secondary">
            {t(
              `rentador.reservas.detalle.metodo.${reservation.paymentMethod}` as Parameters<
                typeof t
              >[0],
            )}{' '}
            · {fmt.dateShort(reservation.paidAt)}
          </p>
        </div>
      )}

      {reservation.status === RESERVATION_STATUS.pending_payment && reservation.holdExpiresAt && (
        <HoldNotice expiresAt={reservation.holdExpiresAt} />
      )}

      {reservation.status === RESERVATION_STATUS.rejected && reservation.rejectionReason && (
        <RejectionReasonCard reason={reservation.rejectionReason} />
      )}

      {reservation.status === RESERVATION_STATUS.pending_approval && (
        <ApprovalActions reservationId={reservation.id} />
      )}

      {reservation.status === RESERVATION_STATUS.confirmed && (
        <PickupAction reservationId={reservation.id} />
      )}

      {reservation.status === RESERVATION_STATUS.in_progress && reservation.returnQrToken && (
        <ReturnQrDisplay returnQrToken={reservation.returnQrToken} />
      )}

      {(reservation.status === RESERVATION_STATUS.confirmed ||
        reservation.status === RESERVATION_STATUS.in_progress) && (
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
      )}
    </div>
  )
}

/**
 * Card destacada con el motivo del rechazo, visible cuando la reserva está
 * en estado `rejected` y el rentador (o el sistema) dejó una `rejectionReason`.
 */
function RejectionReasonCard({ reason }: { reason: string }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 flex gap-3">
      <AlertOctagon className="h-4 w-4 text-danger-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-danger-400 uppercase tracking-wider">
          {t('rentador.reservas.detalle.rejectionReason.titulo')}
        </p>
        <p className="mt-1 text-sm text-text-secondary break-words">{reason}</p>
      </div>
    </div>
  )
}

interface ApprovalActionsProps {
  reservationId: string
}

/**
 * Bloque de acciones para una solicitud en `pending_approval`:
 * botones "Aprobar" (primary, brand) y "Rechazar" (outline, danger).
 *
 * El click en "Aprobar" abre un confirm corto que recuerda al rentador
 * que se dispara la cascada de auto-rechazo. El click en "Rechazar" abre
 * un modal con textarea opcional (max 280 chars) para dejar la razón.
 */
function ApprovalActions({ reservationId }: ApprovalActionsProps) {
  const approveMutation = useApproveReservation()
  const rejectMutation = useRejectReservation()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(reservationId)
      toast.success(t('rentador.reservas.aprobada'))
      setShowApproveConfirm(false)
    } catch {
      toast.error(t('rentador.reservas.errorAccion'))
    }
  }

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({
        reservationId,
        reason: reason.trim().length > 0 ? reason.trim() : undefined,
      })
      toast.success(t('rentador.reservas.rechazada'))
      setShowRejectModal(false)
    } catch {
      toast.error(t('rentador.reservas.errorAccion'))
    }
  }

  const isBusy = approveMutation.isPending || rejectMutation.isPending

  return (
    <>
      <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2 text-sm text-text-secondary">
        {t('rentador.reservas.detalle.solicitudInfo')}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-danger/40 text-danger-400 hover:bg-danger/10"
          onClick={() => setShowRejectModal(true)}
          disabled={isBusy}
        >
          <X className="h-4 w-4" />
          {t('rentador.reservas.detalle.rechazar')}
        </Button>
        <Button
          className="flex-1"
          onClick={() => setShowApproveConfirm(true)}
          disabled={isBusy}
        >
          <Check className="h-4 w-4" />
          {approveMutation.isPending
            ? t('rentador.reservas.detalle.aprobando')
            : t('rentador.reservas.detalle.aprobar')}
        </Button>
      </div>

      {showApproveConfirm && (
        <ApproveConfirmModal
          submitting={approveMutation.isPending}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveConfirm(false)}
        />
      )}

      {showRejectModal && (
        <RejectReasonModal
          submitting={rejectMutation.isPending}
          onSubmit={handleReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </>
  )
}

interface ApproveConfirmModalProps {
  submitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ApproveConfirmModal({ submitting, onConfirm, onCancel }: ApproveConfirmModalProps) {
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
          {t('rentador.reservas.aprobar.confirmTitle')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('rentador.reservas.aprobar.confirmBody')}
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            {t('rentador.reservas.rechazar.cancelar')}
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting
              ? t('rentador.reservas.detalle.aprobando')
              : t('rentador.reservas.aprobar.confirmar')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RejectReasonModalProps {
  submitting: boolean
  onSubmit: (reason: string) => void
  onCancel: () => void
}

const REJECT_REASON_MAX = 280

function RejectReasonModal({ submitting, onSubmit, onCancel }: RejectReasonModalProps) {
  const [reason, setReason] = useState('')
  useLockBodyScroll()
  const overLimit = reason.length > REJECT_REASON_MAX

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
          {t('rentador.reservas.rechazar.modalTitle')}
        </h2>

        <label className="mt-4 mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('rentador.reservas.rechazar.razonLabel')}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('rentador.reservas.rechazar.razonPlaceholder')}
          rows={4}
          maxLength={REJECT_REASON_MAX}
          className="w-full rounded-xl border border-white/8 bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500"
          disabled={submitting}
        />
        <p
          className={`mt-1 text-right text-xs ${
            overLimit ? 'text-danger-400' : 'text-text-muted'
          }`}
        >
          {t('rentador.reservas.rechazar.charCounter').replace(
            '{count}',
            String(reason.length),
          )}
        </p>

        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            {t('rentador.reservas.rechazar.cancelar')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onSubmit(reason)}
            disabled={submitting || overLimit}
          >
            {submitting
              ? t('rentador.reservas.detalle.rechazando')
              : t('rentador.reservas.rechazar.confirmar')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PickupAction({ reservationId }: { reservationId: string }) {
  const [showScanner, setShowScanner] = useState(false)
  const confirmPickup = useConfirmPickup(reservationId)

  const handleScan = async (token: string) => {
    try {
      await confirmPickup.mutateAsync(token)
      toast.success(t('reservas.retiro.exito'))
      setShowScanner(false)
    } catch {
      toast.error(t('reservas.retiro.qrInvalido'))
    }
  }

  return (
    <>
      <Button className="w-full rounded-full" onClick={() => setShowScanner(true)}>
        {t('reservas.retiro.cta')}
      </Button>

      {showScanner && (
        <ScannerModal
          title={t('reservas.retiro.scannerTitle')}
          submitting={confirmPickup.isPending}
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}

function ReturnQrDisplay({ returnQrToken }: { returnQrToken: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = `${window.location.origin}/voucher/return/${returnQrToken}`
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [returnQrToken])

  return (
    <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 flex flex-col items-center gap-3">
      <p className="font-semibold text-text-primary">{t('reservas.devolucion.qrTitle')}</p>
      {qrDataUrl && (
        <div className="h-48 w-48 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-white/6 p-2">
          <img src={qrDataUrl} alt={t('reservas.devolucion.qrTitle')} className="w-full h-full object-contain mix-blend-multiply" />
        </div>
      )}
      <p className="text-xs text-text-muted text-center">{t('reservas.devolucion.qrHelp')}</p>
    </div>
  )
}

interface ScannerModalProps {
  title: string
  submitting: boolean
  onScan: (token: string) => void
  onClose: () => void
}

function ScannerModal({ title, submitting, onScan, onClose }: ScannerModalProps) {
  useLockBodyScroll()
  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl bg-surface-1 border-t border-white/8 p-5 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-text-primary">{title}</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
            aria-label={t('reservas.qr.cancelar')}
          >
            <PhosphorX className="h-4 w-4" weight="bold" />
          </button>
        </div>
        {submitting ? (
          <p className="text-center text-text-muted py-8">{t('reservas.retiro.confirmando')}</p>
        ) : (
          <QrScanner onScan={onScan} />
        )}
      </div>
    </>
  )
}

function HoldNotice({ expiresAt }: { expiresAt: string }) {
  const expiresMs = new Date(expiresAt).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const remainingMs = expiresMs - now
  const expired = remainingMs <= 0
  const minutes = Math.max(0, Math.floor(remainingMs / 60_000))
  return (
    <div
      className={`rounded-xl px-3 py-2 text-sm ${
        expired
          ? 'bg-danger-500/10 text-danger-400'
          : 'bg-warning/10 text-warning'
      }`}
    >
      {expired
        ? t('rentador.reservas.detalle.holdExpirado')
        : `${t('rentador.reservas.detalle.holdActivo')} (${minutes} min)`}
    </div>
  )
}
