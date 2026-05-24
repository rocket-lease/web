import { CreditCard, ArrowLeftRight, Wallet } from 'lucide-react'
import type { PaymentMethod, SavedPaymentMethod } from '@rocket-lease/contracts'
import { t, type I18nKey } from '@/i18n/es'

interface PaymentMethodPickerProps {
  value: PaymentMethod | null
  selectedWalletProvider?: string | null
  onChange: (value: PaymentMethod, walletProvider?: string) => void
  disabled?: boolean
  savedMethods?: SavedPaymentMethod[]
  isLoading?: boolean
}

export function PaymentMethodPicker({
  value,
  selectedWalletProvider,
  onChange,
  disabled,
  savedMethods = [],
  isLoading,
}: PaymentMethodPickerProps) {
  if (isLoading) {
    return <div className="text-sm text-text-muted">{t('general.loading' as I18nKey)}</div>
  }

  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {savedMethods.map((method) => {
        const isCard = method.type === 'card'
        const Icon = isCard ? CreditCard : Wallet
        const methodValue = isCard ? 'credit_card' : 'digital_wallet'
        const provider = method.type === 'digital_wallet' ? method.details.provider : undefined
        
        const selected = value === methodValue && (method.type !== 'digital_wallet' || selectedWalletProvider === provider)
        
        const title = isCard 
          ? `Tarjeta ${method.details.brand} terminada en ${method.details.lastFour || '****'}`
          : `Billetera Virtual (${method.details.provider})`

        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(methodValue, provider)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
              selected
                ? 'border-brand-500 bg-brand-500/10 text-text-primary'
                : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{title}</span>
          </button>
        )
      })}
      
      <button
        type="button"
        role="radio"
        aria-checked={value === 'bank_transfer'}
        disabled={disabled}
        onClick={() => onChange('bank_transfer')}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
          value === 'bank_transfer'
            ? 'border-brand-500 bg-brand-500/10 text-text-primary'
            : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
        }`}
      >
        <ArrowLeftRight className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          {t('reservar.paymentMethod.bank_transfer' as I18nKey)}
        </span>
      </button>

      {savedMethods.length === 0 && (
        <p className="text-xs text-text-muted mt-2">
          No tenés tarjetas guardadas. Podés agregarlas desde tu perfil.
        </p>
      )}
    </div>
  )
}
