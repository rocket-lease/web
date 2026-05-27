import { useState, useCallback } from 'react'
import { X, Sparkles, Clock, CreditCard, ArrowLeftRight, Wallet, Copy, Check } from 'lucide-react'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useVehiclePromotion, useVehiclePromotionPolling, usePromotionDurations, usePromoteVehicle } from '../hooks/usePromocionar'
import type { I18nKey } from '@/i18n/es'
import type { PaymentMethod, PromoteVehicleResponse } from '@rocket-lease/contracts'

type Step = 'form' | 'transfer_pending'

interface PromocionarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleId: string
}

const PAYMENT_METHODS: Array<{ id: PaymentMethod; icon: typeof CreditCard; labelKey: I18nKey }> = [
  { id: 'credit_card', icon: CreditCard, labelKey: 'promocionar.paymentMethod.credit_card' as I18nKey },
  { id: 'debit_card', icon: CreditCard, labelKey: 'promocionar.paymentMethod.debit_card' as I18nKey },
  { id: 'bank_transfer', icon: ArrowLeftRight, labelKey: 'promocionar.paymentMethod.bank_transfer' as I18nKey },
  { id: 'digital_wallet', icon: Wallet, labelKey: 'promocionar.paymentMethod.digital_wallet' as I18nKey },
]

const WALLET_OPTIONS = [
  { id: 'mercadopago', labelKey: 'promocionar.paymentMethod.mercadopago' as I18nKey },
  { id: 'uala', labelKey: 'promocionar.paymentMethod.uala' as I18nKey },
]

export function PromocionarDialog({ open, onOpenChange, vehicleId }: PromocionarDialogProps) {
  const { data: promotionData } = useVehiclePromotion(open ? vehicleId : undefined)
  const promoteMutation = usePromoteVehicle()
  const { data: durations = [] } = usePromotionDurations()

  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('form')
  const [promoteResult, setPromoteResult] = useState<PromoteVehicleResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const isPolling = step === 'transfer_pending'
  const { data: polledPromotion } = useVehiclePromotionPolling(isPolling ? vehicleId : undefined, isPolling)

  const activePromotion = promotionData?.active ? promotionData.promotion : null

  const selectedDurationCost = durations.find(d => d.days === selectedDuration)?.valueInCents ?? 0
  const totalCents = selectedDurationCost

  const isActive = activePromotion?.status === 'active'
  const isPendingApproval = activePromotion?.status === 'pending_approval'

  const handlePromote = useCallback(() => {
    if (!selectedDuration) return
    promoteMutation.mutate(
      {
        vehicleId,
        data: {
          durationDays: selectedDuration,
          startDate: new Date().toISOString(),
          paymentMethod: selectedMethod ?? 'credit_card',
          ...(selectedMethod === 'digital_wallet' && selectedWallet ? { walletProvider: selectedWallet } : {}),
        },
      },
      {
        onSuccess: (result) => {
          setPromoteResult(result)
          if (result.status === 'pending_approval') {
            setStep('transfer_pending')
          } else {
            onOpenChange(false)
          }
        },
      },
    )
  }, [selectedDuration, selectedMethod, selectedWallet, vehicleId, promoteMutation, onOpenChange])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedDuration(null)
      setSelectedMethod(null)
      setSelectedWallet(null)
      setStep('form')
      setPromoteResult(null)
      setCopied(null)
    }
    onOpenChange(next)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!open) return null

  const renderActive = () => {
    if (!activePromotion || activePromotion.status !== 'active') return null

    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Sparkles className="h-10 w-10 text-owner" />
        <Badge variant="warning" className="text-sm px-4 py-1">
          {t('promocionar.active')}
        </Badge>
        <p className="text-sm text-text-secondary">
          {t('promocionar.expiresAt').replace('{date}', fmt.dateShort(activePromotion.endsAt))}
        </p>
        <p className="text-xs text-text-muted">
          {t('promocionar.paidAt').replace('{date}', fmt.dateShort(activePromotion.paidAt))}
        </p>
        <p className="text-xs text-text-muted font-mono">
          {t('promocionar.transactionId').replace('{id}', activePromotion.transactionId)}
        </p>
      </div>
    )
  }

  const renderTransferPending = () => {
    const p: { transferCode: string; transferAlias: string } | null =
      polledPromotion?.promotion?.status === 'pending_approval'
        ? polledPromotion.promotion
        : promoteResult?.status === 'pending_approval'
          ? promoteResult
          : null

    const isNowActive = polledPromotion?.promotion?.status === 'active'

    if (isNowActive) {
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Sparkles className="h-10 w-10 text-owner" />
          <Badge variant="warning" className="text-sm px-4 py-1">
            {t('promocionar.active')}
          </Badge>
          {renderActive()}
          <Button className="mt-2" onClick={() => handleOpenChange(false)}>
            {t('general.confirm')}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Clock className="h-10 w-10 text-brand-400 animate-pulse" />
        <p className="text-sm font-semibold text-text-primary">{t('promocionar.transfer.pending')}</p>

        {p && p.transferAlias && (
          <div className="w-full space-y-3 text-left">
            <div className="rounded-xl bg-surface-2 border border-white/8 p-4 space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-1">{t('promocionar.transfer.alias').replace('{alias}', '')}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono font-bold text-text-primary">{p.transferAlias}</p>
                  <button
                    onClick={() => copyToClipboard(p.transferAlias)}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-surface-1 hover:bg-white/10"
                  >
                    {copied === p.transferAlias ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-text-muted" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">{t('promocionar.transfer.code').replace('{code}', '')}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono font-bold text-text-primary">{p.transferCode}</p>
                  <button
                    onClick={() => copyToClipboard(p.transferCode)}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-surface-1 hover:bg-white/10"
                  >
                    {copied === p.transferCode ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-text-muted" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-muted">{t('promocionar.transfer.expiresAt')}</p>
          </div>
        )}
      </div>
    )
  }

  const renderForm = () => (
    <>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-400" />
          {t('promocionar.duration')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => {
            const selected = selectedDuration === d.days
            return (
              <button
                key={d.days}
                type="button"
                onClick={() => setSelectedDuration(d.days)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
                }`}
              >
                <span className="text-sm font-bold">{t('promocionar.durationDays').replace('{days}', String(d.days))}</span>
                <span className="text-xs">{fmt.currency(d.valueInCents)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-primary">{t('promocionar.paymentMethod')}</p>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon
            const selected = selectedMethod === method.id
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setSelectedMethod(method.id)
                  setSelectedWallet(null)
                }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-500/10 text-text-primary'
                    : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${selected ? 'text-brand-400' : 'text-text-muted'}`} />
                <span className="text-sm font-medium">{t(method.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedMethod === 'digital_wallet' && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">{t('promocionar.paymentMethod.walletProvider')}</p>
          <div className="flex gap-2">
            {WALLET_OPTIONS.map((w) => {
              const selected = selectedWallet === w.id
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWallet(w.id)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium text-center transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
                  }`}
                >
                  {t(w.labelKey)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-surface-2 border border-white/8 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">{t('promocionar.total')}</p>
          <p className="text-lg font-bold text-text-primary">{fmt.currency(totalCents)}</p>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!selectedDuration || !selectedMethod || (selectedMethod === 'digital_wallet' && !selectedWallet) || promoteMutation.isPending}
        onClick={handlePromote}
      >
        {promoteMutation.isPending
          ? t('promocionar.promoting')
          : t('promocionar.promote').replace('{amount}', fmt.currency(totalCents))}
      </Button>
    </>
  )

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-overlay-in"
        onClick={() => handleOpenChange(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl bg-surface-1 border-t border-white/8 max-h-[85svh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <p className="font-semibold text-text-primary">{t('promocionar.title')}</p>
          <button
            onClick={() => handleOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 pb-8">
          <p className="text-sm text-text-secondary">{t('promocionar.description')}</p>

          {isActive ? (
            renderActive()
          ) : isPendingApproval || step === 'transfer_pending' ? (
            renderTransferPending()
          ) : (
            renderForm()
          )}
        </div>
      </div>
    </>
  )
}
