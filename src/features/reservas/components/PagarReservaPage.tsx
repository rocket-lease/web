import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Bank, QrCode, Wallet } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t, type I18nKey } from '@/i18n/es'
import { useState } from 'react'
import { reservarApi } from '@/features/reservar/api/reservar.api'

const PAYMENT_METHODS = [
  { id: 'credit_card' as const, label: 'reservas.pago.metodo.credit_card', icon: CreditCard },
  { id: 'debit_card' as const, label: 'reservas.pago.metodo.debit_card', icon: CreditCard },
  { id: 'bank_transfer' as const, label: 'reservas.pago.metodo.bank_transfer', icon: Bank },
  { id: 'digital_wallet' as const, label: 'reservas.pago.metodo.digital_wallet', icon: Wallet },
]

const WALLET_OPTIONS = [
  { id: 'mercadopago' as const, label: 'reservas.pago.billetera.mercadopago' },
  { id: 'uala' as const, label: 'reservas.pago.billetera.uala' },
]

type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id']

export function PagarReservaPage() {
  const { id = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const { data: reservation } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
  })

  const totalCents = reservation?.totalCents ?? 0
  const vehicle = reservation?.vehicle
  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ''

  const depositPercentage = reservation?.depositPercentageSnapshot ?? null
  const depositCents =
    depositPercentage !== null ? Math.floor((totalCents * depositPercentage) / 100) : 0

  const handleConfirm = async () => {
    if (!selectedMethod) return
    setProcessing(true)

    try {
      if (selectedMethod === 'bank_transfer') {
        await reservarApi.initiateTransfer(id)
        navigate({ to: `/reservas-transferencia/${id}` })
      } else {
        await reservarApi.confirmPayment(id, { paymentMethod: selectedMethod })
        navigate({ to: `/reservas/${id}` })
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={t('reservas.pago.title')}
        showBack
      />

      <div className="px-4 py-5 space-y-6 flex-1">
        {/* Resumen */}
        <div className="card p-4 space-y-2">
          <p className="text-sm text-text-muted">{t('reservas.pago.summary')}</p>
          <p className="font-semibold text-text-primary">{vehicleName}</p>
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm">{t('reservas.detail.total')}</span>
            <span className="text-xl font-bold text-brand-400">{fmt.currency(totalCents)}</span>
          </div>
        </div>

        {depositPercentage !== null && (
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

        {/* Selección de método */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {t('reservas.pago.selectMethod')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id)
                    setSelectedWallet(null)
                  }}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-brand-400 bg-brand-400/10 ring-1 ring-brand-400'
                      : 'border-white/10 bg-surface-2 hover:border-white/20'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-brand-400' : 'text-text-muted'}`} />
                  <span className={`text-xs font-medium ${isSelected ? 'text-brand-400' : 'text-text-secondary'}`}>
                    {t(method.label as I18nKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Wallet provider selector (solo si es digital_wallet) */}
        {selectedMethod === 'digital_wallet' && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">{t('reservas.pago.selectWallet')}</p>
            <div className="flex gap-2">
              {WALLET_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWallet(w.id)}
                  className={`flex-1 rounded-xl border py-3 text-center text-sm font-medium transition-all ${
                    selectedWallet === w.id
                      ? 'border-brand-400 bg-brand-400/10 text-brand-400'
                      : 'border-white/10 bg-surface-2 text-text-secondary'
                  }`}
                >
                  {t(w.label as I18nKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bank transfer info */}
        {selectedMethod === 'bank_transfer' && (
          <div className="rounded-xl bg-surface-2 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-medium text-text-primary">
                {t('reservas.pago.transferInfo')}
              </p>
            </div>
            <p className="text-xs text-text-muted">
              {t('reservas.pago.transferHint')}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-white/10 bg-surface-1 p-4">
        <Button
          className="w-full"
          disabled={!selectedMethod || (selectedMethod === 'digital_wallet' && !selectedWallet) || processing}
          onClick={handleConfirm}
        >
          {processing ? t('general.loading') : t('reservas.pago.confirm')}
        </Button>
      </div>
    </div>
  )
}
