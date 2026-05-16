import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, QrCode } from 'lucide-react'
import type { PaymentMethod } from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { useConfirmPayment } from '@/features/reservar/hooks/useConfirmPayment'
import { PaymentMethodPicker } from '@/features/reservar/components/PaymentMethodPicker'
import { HoldCountdown } from '@/features/reservar/components/HoldCountdown'

export function ReservaDetailPage() {
  const { id = '' } = useParams({ strict: false })

  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="px-4 py-5 space-y-4">
          <div className="h-6 w-1/2 rounded bg-surface-2 animate-pulse" />
          <div className="h-40 rounded-2xl bg-surface-2 animate-pulse" />
          <div className="h-20 rounded-2xl bg-surface-2 animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError || !reservation) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-sm text-danger">{t('reservar.errors.RESERVATION_NOT_FOUND')}</p>
        </div>
      </div>
    )
  }

  const { vehicle, rentador, status, startAt, endAt, totalCents, paymentMethod, holdExpiresAt } = reservation
  const showVoucher = status === 'confirmed' || status === 'in_progress'
  const canPay = status === 'pending_payment'

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.detail.title')} showBack />

      <div className="px-4 py-5 space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">Reserva #{reservation.id.slice(0, 8)}</p>
          <ReservaStatusBadge estado={status} />
        </div>

        {/* Vehicle */}
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

        {/* QR Voucher */}
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

        {/* Dates */}
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

        {/* Rentador */}
        <div className="flex items-center gap-3">
          <Avatar
            src={rentador.avatarUrl ?? undefined}
            fallback={rentador.name.slice(0, 2).toUpperCase()}
            size="md"
          />
          <div>
            <p className="text-xs text-text-muted">Rentador</p>
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

        {/* Total */}
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
      </div>
    </div>
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

  const onPay = async () => {
    if (!method) return
    try {
      await confirmPayment.mutateAsync({ paymentMethod: method })
    } catch {
      // surfaced via confirmPayment.error
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
