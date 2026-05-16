import { CreditCard, Banknote, ArrowLeftRight } from 'lucide-react'
import type { PaymentMethod } from '@rocket-lease/contracts'
import { t, type I18nKey } from '@/i18n/es'

const METHODS: Array<{ value: PaymentMethod; icon: typeof CreditCard }> = [
  { value: 'credit_card', icon: CreditCard },
  { value: 'debit_card', icon: Banknote },
  { value: 'bank_transfer', icon: ArrowLeftRight },
]

interface PaymentMethodPickerProps {
  value: PaymentMethod | null
  onChange: (value: PaymentMethod) => void
  disabled?: boolean
}

export function PaymentMethodPicker({
  value,
  onChange,
  disabled,
}: PaymentMethodPickerProps) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {METHODS.map(({ value: methodValue, icon: Icon }) => {
        const selected = value === methodValue
        return (
          <button
            key={methodValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(methodValue)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
              selected
                ? 'border-brand-500 bg-brand-500/10 text-text-primary'
                : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              {t(`reservar.paymentMethod.${methodValue}` as I18nKey)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
