import { useForm } from 'react-hook-form'
import type { FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { t, type I18nKey } from '@/i18n/es'
import type { SavedPaymentMethod, CreateSavedPaymentMethod, UpdateSavedPaymentMethod } from '@rocket-lease/contracts'
import { WalletDetailsSchema } from '@rocket-lease/contracts'

const WALLET_PROVIDERS = [
  'Mercado Pago', 'Ualá', 'Naranja X', 'Personal Pay', 
  'Brubank', 'Modo', 'Cuenta DNI', 'BNA+', 'YPF App'
]

interface PaymentMethodFormProps {
  initialData?: SavedPaymentMethod | null
  onSubmit: (data: CreateSavedPaymentMethod | UpdateSavedPaymentMethod) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

// Temporary lenient validation as requested: allow any 16 digits
const LenientCardDetailsSchema = z.object({
  brand: z.string().min(1),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2000).max(2100),
  cardholderName: z.string().min(1),
  cardNumber: z.string().regex(/^\d{16}$/, 'Debe tener 16 dígitos').optional(),
})

const CombinedSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('card'),
    cardDetails: LenientCardDetailsSchema,
    walletDetails: z.any().optional(),
  }),
  z.object({
    type: z.literal('digital_wallet'),
    cardDetails: z.any().optional(),
    walletDetails: WalletDetailsSchema,
  })
])

type FormData = z.infer<typeof CombinedSchema>
type CardFieldErrors = FieldErrors<z.infer<typeof LenientCardDetailsSchema>>
type WalletFieldErrors = FieldErrors<z.infer<typeof WalletDetailsSchema>>

export function PaymentMethodForm({ initialData, onSubmit, onCancel, isLoading }: PaymentMethodFormProps) {
  const isEditing = !!initialData

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: {
      type: initialData?.type ?? 'card',
      cardDetails: initialData?.type === 'card' ? {
        brand: initialData.details.brand,
        expMonth: initialData.details.expMonth,
        expYear: initialData.details.expYear,
        cardholderName: initialData.details.cardholderName,
      } : undefined,
      walletDetails: initialData?.type === 'digital_wallet' ? {
        provider: initialData.details.provider,
        alias: initialData.details.alias,
      } : undefined,
    }
  })

  const cardErrors = errors.cardDetails as CardFieldErrors | undefined
  const walletErrors = errors.walletDetails as WalletFieldErrors | undefined

  // eslint-disable-next-line react-hooks/incompatible-library
  const type = watch('type')

  const handleFormSubmit = async (data: FormData) => {
    if (isEditing && initialData) {
      if (data.type === 'card' && data.cardDetails) {
        await onSubmit({
          type: 'card',
          details: {
            expMonth: data.cardDetails.expMonth,
            expYear: data.cardDetails.expYear,
            cardholderName: data.cardDetails.cardholderName,
          }
        })
      } else if (data.type === 'digital_wallet' && data.walletDetails) {
        await onSubmit({
          type: 'digital_wallet',
          details: {
            alias: data.walletDetails.alias
          }
        })
      }
    } else {
      if (data.type === 'card' && data.cardDetails) {
        await onSubmit({
          type: 'card',
          details: {
            lastFour: data.cardDetails.cardNumber?.slice(-4) ?? '0000',
            brand: data.cardDetails.brand,
            expMonth: data.cardDetails.expMonth,
            expYear: data.cardDetails.expYear,
            cardholderName: data.cardDetails.cardholderName,
          }
        } as CreateSavedPaymentMethod)
      } else if (data.type === 'digital_wallet' && data.walletDetails) {
        await onSubmit({
          type: 'digital_wallet',
          details: {
            provider: data.walletDetails.provider,
            alias: data.walletDetails.alias,
          }
        } as CreateSavedPaymentMethod)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 p-4">
      {!isEditing && (
        <div className="space-y-2">
          <Label>{t('paymentMethods.form.type' as I18nKey)}</Label>
          <select 
            {...register('type')}
            className="flex h-10 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-text-primary ring-offset-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="card">{t('paymentMethods.card' as I18nKey)}</option>
            <option value="digital_wallet">{t('paymentMethods.wallet' as I18nKey)}</option>
          </select>
        </div>
      )}

      {type === 'card' && (
        <>
          <div className="space-y-2">
            <Label>{t('paymentMethods.form.cardBrand' as I18nKey)}</Label>
            <Input 
              {...register('cardDetails.brand')} 
              placeholder="VISA, MasterCard..." 
              disabled={isEditing}
            />
            {cardErrors?.brand && <span className="text-xs text-danger">{cardErrors.brand.message}</span>}
          </div>
          
          {!isEditing && (
            <div className="space-y-2">
              <Label>Número de tarjeta (16 dígitos)</Label>
              <Input 
                {...register('cardDetails.cardNumber')} 
                placeholder="1234123412341234" 
                maxLength={16}
              />
              {cardErrors?.cardNumber && <span className="text-xs text-danger">{cardErrors.cardNumber.message}</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('paymentMethods.form.expMonth' as I18nKey)}</Label>
              <Input 
                type="number" 
                {...register('cardDetails.expMonth', { valueAsNumber: true })} 
                placeholder="12" 
                min={1} max={12}
              />
              {cardErrors?.expMonth && <span className="text-xs text-danger">{cardErrors.expMonth.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>{t('paymentMethods.form.expYear' as I18nKey)}</Label>
              <Input 
                type="number" 
                {...register('cardDetails.expYear', { valueAsNumber: true })} 
                placeholder="2030" 
              />
              {cardErrors?.expYear && <span className="text-xs text-danger">{cardErrors.expYear.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('paymentMethods.form.cardholderName' as I18nKey)}</Label>
            <Input {...register('cardDetails.cardholderName')} placeholder="Juan Pérez" />
            {cardErrors?.cardholderName && <span className="text-xs text-danger">{cardErrors.cardholderName.message}</span>}
          </div>
        </>
      )}

      {type === 'digital_wallet' && (
        <>
          <div className="space-y-2">
            <Label>{t('paymentMethods.form.walletProvider' as I18nKey)}</Label>
            {isEditing ? (
              <Input {...register('walletDetails.provider')} disabled />
            ) : (
              <select 
                {...register('walletDetails.provider')}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-sm text-text-primary ring-offset-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="">Seleccioná un proveedor...</option>
                {WALLET_PROVIDERS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
            {walletErrors?.provider && <span className="text-xs text-danger">{walletErrors.provider.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label>{t('paymentMethods.form.walletAlias' as I18nKey)}</Label>
            <Input {...register('walletDetails.alias')} placeholder="mi.alias.mp" />
            {walletErrors?.alias && <span className="text-xs text-danger">{walletErrors.alias.message}</span>}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('general.saving' as I18nKey) : t('paymentMethods.save' as I18nKey)}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('paymentMethods.form.cancel' as I18nKey)}
        </Button>
      </div>
    </form>
  )
}
