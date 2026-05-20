import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, CalendarDots, Car, User, Wallet, WarningCircle } from '@phosphor-icons/react'
import { RESERVATION_STATUS, type VerifyVoucherResponse } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { useConfirmPickup } from '../hooks/useConfirmPickup'

export function VoucherVerifyPage() {
  const { token } = useParams({ strict: false })

  const { data: voucher, isLoading, isError } = useQuery({
    queryKey: ['voucher', 'verify', token],
    queryFn: () => reservarApi.verifyVoucher(token as string),
    enabled: !!token,
    retry: false,
  })

  const confirmPickup = useConfirmPickup(voucher?.reservationId ?? '')

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-surface-0">
        <PageHeader title={t('reservas.voucher.verifyTitle')} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted">{t('general.loading')}</p>
        </div>
      </div>
    )
  }

  if (isError || !voucher) {
    return (
      <div className="flex flex-col min-h-dvh bg-surface-0">
        <PageHeader title={t('reservas.voucher.verifyTitle')} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <XCircle className="h-16 w-16 text-danger" weight="fill" />
          <h2 className="text-xl font-bold text-text-primary">{t('reservas.voucher.invalidTitle')}</h2>
          <p className="text-text-secondary">{t('reservas.voucher.invalidBody')}</p>
        </div>
      </div>
    )
  }

  const isAlreadyInProgress = voucher.status === RESERVATION_STATUS.in_progress
  const isConfirmed = voucher.status === RESERVATION_STATUS.confirmed

  return (
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <PageHeader title={t('reservas.voucher.verifyTitle')} />

      <div className="flex-1 p-4 space-y-4">
        {(confirmPickup.isSuccess || isAlreadyInProgress) && (
          <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-6 flex flex-col items-center text-center gap-3">
            <CheckCircle className="h-12 w-12 text-brand-500" weight="fill" />
            <div>
              <h2 className="text-xl font-bold text-brand-500">{t('reservas.retiro.exito')}</h2>
              <p className="text-sm text-text-secondary mt-1">{t('reservas.voucher.validBody')}</p>
            </div>
          </div>
        )}

        {confirmPickup.isError && (
          <div className="rounded-2xl bg-danger/10 border border-danger/20 p-6 flex flex-col items-center text-center gap-3">
            <WarningCircle className="h-12 w-12 text-danger" weight="fill" />
            <div>
              <h2 className="text-xl font-bold text-danger">{t('reservas.retiro.qrInvalido')}</h2>
              <p className="text-sm text-text-secondary mt-1">{t('reservas.voucher.invalidBody')}</p>
            </div>
          </div>
        )}

        {!confirmPickup.isSuccess && !isAlreadyInProgress && !confirmPickup.isError && (isConfirmed ? (
          <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4 flex flex-col items-center text-center gap-2">
            <CheckCircle className="h-10 w-10 text-brand-500" />
            <p className="text-sm font-semibold text-brand-500">{t('reservas.voucher.validTitle')}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-danger/10 border border-danger/20 p-6 flex flex-col items-center text-center gap-3">
            <XCircle className="h-12 w-12 text-danger" weight="fill" />
            <div>
              <h2 className="text-xl font-bold text-danger">{t('reservas.voucher.invalidTitle')}</h2>
              <p className="text-sm text-text-secondary mt-1">
                {t('reservas.voucher.statusWas')} <strong className="uppercase">{voucher.status}</strong>
              </p>
            </div>
          </div>
        ))}

        {(isConfirmed || confirmPickup.isSuccess || isAlreadyInProgress) && (
          <ReservationDetails voucher={voucher} />
        )}

        {isConfirmed && !confirmPickup.isSuccess && (
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => confirmPickup.mutate(token as string)}
              disabled={confirmPickup.isPending}
              className="w-full"
            >
              {confirmPickup.isPending
                ? t('reservas.retiro.confirmando')
                : t('reservas.retiro.confirmar')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info(t('reservas.retiro.dataMismatchToast'))}
              disabled={confirmPickup.isPending}
              className="w-full"
            >
              {t('reservas.retiro.dataMismatch')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReservationDetails({ voucher }: { voucher: VerifyVoucherResponse }) {
  return (
    <div className="card p-4 space-y-4">
      <h3 className="font-bold text-text-primary">{t('reservas.voucher.details')}</h3>

      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-text-muted" />
        <div>
          <p className="text-xs text-text-muted">{t('reservas.detalle.conductor')}</p>
          <p className="font-medium text-text-primary">{voucher.conductor.name}</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Car className="h-5 w-5 text-text-muted" />
        <div>
          <p className="text-xs text-text-muted">{t('vehiculo.esMio')}</p>
          <p className="font-medium text-text-primary">
            {voucher.vehicle.brand} {voucher.vehicle.model}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <CalendarDots className="h-5 w-5 text-text-muted" />
        <div>
          <p className="text-xs text-text-muted">{t('reservas.detail.dates')}</p>
          <p className="font-medium text-text-primary">
            {fmt.dateTime(voucher.startAt)} - {fmt.dateTime(voucher.endAt)}
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Wallet className="h-5 w-5 text-text-muted" />
        <div className="flex-1">
          <p className="text-xs text-text-muted">{t('reservas.detalle.pago')}</p>
          <p className="font-medium text-text-primary">
            {t(`reservar.paymentMethod.${voucher.paymentMethod}` as import('@/i18n/es').I18nKey)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-brand-400">{fmt.currency(voucher.totalCents)}</p>
        </div>
      </div>
    </div>
  )
}
