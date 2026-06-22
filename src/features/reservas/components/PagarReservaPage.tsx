import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { PaymentMethod } from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { useState } from 'react'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { PaymentMethodPicker } from '@/features/reservar/components/PaymentMethodPicker'
import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods'
import { useCurrentTime } from '@/hooks/useCurrentTime'

export function PagarReservaPage() {
  const { id = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [walletProvider, setWalletProvider] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const { data: reservation } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
  })

  // Medios de pago guardados por el usuario: solo se ofrecen los disponibles.
  const { paymentMethods: savedPaymentMethods, isLoading: isLoadingPaymentMethods } =
    usePaymentMethods()

  const totalCents = reservation?.totalCents ?? 0
  const vehicle = reservation?.vehicle
  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ''

  const depositPercentage = reservation?.depositPercentageSnapshot ?? null
  const depositCents =
    depositPercentage !== null ? Math.floor((totalCents * depositPercentage) / 100) : 0

  // US-30: reserva señada → se paga solo el saldo restante.
  const isBalanceMode = reservation?.status === 'pending_balance'
  const depositPaidCents = reservation?.depositPaidCents ?? 0
  const balanceCents = totalCents - depositPaidCents
  const balanceDueAt = reservation?.balanceDueAt ?? null
  const now = useCurrentTime()
  const balanceDueSoon =
    !!balanceDueAt &&
    new Date(balanceDueAt).getTime() - now < 24 * 60 * 60 * 1000

  const handleConfirm = async () => {
    if (!selectedMethod) return
    setProcessing(true)

    const provider =
      selectedMethod === 'digital_wallet' && walletProvider ? walletProvider : undefined

    try {
      if (isBalanceMode) {
        if (selectedMethod === 'bank_transfer') {
          await reservarApi.initiateBalanceTransfer(id)
          navigate({ to: `/reservas-transferencia/${id}` })
        } else {
          await reservarApi.payBalance(id, {
            paymentMethod: selectedMethod,
            walletProvider: provider,
          })
          navigate({ to: `/reservas/${id}` })
        }
        return
      }

      if (selectedMethod === 'bank_transfer') {
        await reservarApi.initiateTransfer(id)
        navigate({ to: `/reservas-transferencia/${id}` })
      } else {
        await reservarApi.confirmPayment(id, {
          paymentMethod: selectedMethod,
          walletProvider: provider,
        })
        navigate({ to: `/reservas/${id}` })
      }
    } finally {
      setProcessing(false)
    }
  }

  const confirmDisabled =
    !selectedMethod ||
    (selectedMethod === 'digital_wallet' && !walletProvider) ||
    processing

  return (
    <div className="flex flex-col min-h-dvh">
      <PageHeader
        title={isBalanceMode ? t('reservas.saldo.title') : t('reservas.pago.title')}
        showBack
        sticky
      />

      <div className="px-4 py-5 space-y-6 flex-1">
        {/* Resumen */}
        <div className="card p-4 space-y-2">
          <p className="text-sm text-text-muted">{t('reservas.pago.summary')}</p>
          <p className="font-semibold text-text-primary">{vehicleName}</p>
          {isBalanceMode ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{t('reservas.saldo.depositPaid')}</span>
                <span className="text-text-secondary">{fmt.currency(depositPaidCents)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{t('reservas.saldo.remaining')}</span>
                <span className="text-xl font-bold text-brand-400">{fmt.currency(balanceCents)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">{t('reservas.detail.total')}</span>
              <span className="text-xl font-bold text-brand-400">{fmt.currency(totalCents)}</span>
            </div>
          )}
        </div>

        {isBalanceMode && balanceDueAt && (
          <div
            className={`rounded-xl border px-4 py-3 ${
              balanceDueSoon
                ? 'border-danger/30 bg-danger/5'
                : 'border-amber-400/20 bg-amber-400/5'
            }`}
            data-testid="balance-deadline"
          >
            <p className={`text-sm ${balanceDueSoon ? 'text-danger' : 'text-amber-400'}`}>
              {balanceDueSoon
                ? t('reservas.saldo.alert24h')
                : t('reservas.saldo.dueAt').replace('{date}', fmt.dateTime(balanceDueAt))}
            </p>
          </div>
        )}

        {!isBalanceMode && depositPercentage !== null && (
          <div
            className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3"
            data-testid="payment-breakdown"
          >
            <p className="text-sm text-amber-400">
              {t('reserva.breakdown.depositNotice')
                .replace('{percentage}', String(depositPercentage))
                .replace('{amount}', fmt.currency(depositCents))}
            </p>
          </div>
        )}

        <Separator />

        {/* Selección de método: medios guardados del usuario + transferencia */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {t('reservas.pago.selectMethod')}
          </p>
          <PaymentMethodPicker
            value={selectedMethod}
            selectedWalletProvider={walletProvider}
            onChange={(method, provider) => {
              setSelectedMethod(method)
              setWalletProvider(provider || null)
            }}
            disabled={processing}
            savedMethods={savedPaymentMethods || []}
            isLoading={isLoadingPaymentMethods}
          />
          <Link
            to="/perfil/medios-de-pago"
            className="block text-xs text-brand-400 hover:underline"
          >
            {t('reservas.pago.addMethod')}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-white/10 bg-surface-1 p-4">
        <Button className="w-full" disabled={confirmDisabled} onClick={handleConfirm}>
          {processing
            ? t('general.loading')
            : isBalanceMode
              ? t('reservas.saldo.confirm')
              : t('reservas.pago.confirm')}
        </Button>
      </div>
    </div>
  )
}
