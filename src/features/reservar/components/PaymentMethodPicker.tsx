import { useState } from 'react'
import { CreditCard, ArrowLeftRight, Wallet, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [expandedCategory, setExpandedCategory] = useState<'card' | 'digital_wallet' | null>(null)
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)

  if (isLoading) {
    return <div className="text-sm text-text-muted">{t('general.loading' as I18nKey)}</div>
  }

  const cards = savedMethods.filter(m => m.type === 'card')
  const wallets = savedMethods.filter(m => m.type === 'digital_wallet')

  const handleSelect = (methodValue: PaymentMethod, methodId: string | null, provider?: string) => {
    setSelectedMethodId(methodId)
    onChange(methodValue, provider)
  }

  const toggleCategory = (category: 'card' | 'digital_wallet') => {
    setExpandedCategory(prev => (prev === category ? null : category))
  }

  const renderMethodItem = (method: SavedPaymentMethod, isSubItem = false) => {
    const isCard = method.type === 'card'
    const Icon = isCard ? CreditCard : Wallet
    const methodValue = isCard ? 'credit_card' : 'digital_wallet'
    const provider = method.type === 'digital_wallet' ? method.details.provider : undefined
    
    // Si hay un solo elemento de esta categoría, o no usamos subitems, nos basamos en 'value'
    // Si hay multiples y usamos subitems, usamos selectedMethodId
    const isSelected = selectedMethodId 
      ? selectedMethodId === method.id 
      : (value === methodValue && (method.type !== 'digital_wallet' || selectedWalletProvider === provider))

    const title = isCard 
      ? `Tarjeta ${method.details.brand} terminada en ${method.details.lastFour || '****'}`
      : `Billetera Virtual (${method.details.provider})`

    return (
      <button
        key={method.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={disabled}
        onClick={() => handleSelect(methodValue, method.id, provider)}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
          isSubItem ? 'ml-6' : ''
        } ${
          isSelected
            ? 'border-brand-500 bg-brand-500/10 text-text-primary'
            : 'border-white/8 bg-surface-2 text-text-secondary hover:border-white/20'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">{title}</span>
      </button>
    )
  }

  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {/* Cards Group */}
      {cards.length === 1 && renderMethodItem(cards[0])}
      {cards.length > 1 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => toggleCategory('card')}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-left text-text-secondary hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Tarjetas guardadas ({cards.length})</span>
            </div>
            {expandedCategory === 'card' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expandedCategory === 'card' && cards.map(c => renderMethodItem(c, true))}
        </div>
      )}

      {/* Wallets Group */}
      {wallets.length === 1 && renderMethodItem(wallets[0])}
      {wallets.length > 1 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => toggleCategory('digital_wallet')}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-left text-text-secondary hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Billeteras Virtuales ({wallets.length})</span>
            </div>
            {expandedCategory === 'digital_wallet' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expandedCategory === 'digital_wallet' && wallets.map(w => renderMethodItem(w, true))}
        </div>
      )}
      
      {/* Bank Transfer */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'bank_transfer'}
        disabled={disabled}
        onClick={() => handleSelect('bank_transfer', null)}
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
