import { CreditCard, Wallet, PencilSimple, Trash, WarningCircle } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { t, type I18nKey } from '@/i18n/es'
import type { SavedPaymentMethod } from '@rocket-lease/contracts'
import { useState } from 'react'

interface PaymentMethodCardProps {
  method: SavedPaymentMethod
  isLastMethod: boolean
  onEdit: (method: SavedPaymentMethod) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function PaymentMethodCard({ method, isLastMethod, onEdit, onDelete, isDeleting }: PaymentMethodCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isCard = method.type === 'card'
  const title = isCard ? t('paymentMethods.card' as I18nKey) : t('paymentMethods.wallet' as I18nKey)
  
  const subtitle = isCard 
    ? t('paymentMethods.lastFour' as I18nKey).replace('{lastFour}', method.details.lastFour)
    : method.details.provider

  const additionalInfo = isCard
    ? `${method.details.brand} • Vence ${method.details.expMonth.toString().padStart(2, '0')}/${method.details.expYear}`
    : method.details.alias

  const handleDelete = () => {
    onDelete(method.id)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3">
            {isCard ? <CreditCard className="h-5 w-5 text-brand-400" /> : <Wallet className="h-5 w-5 text-brand-400" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-xs text-text-secondary">{subtitle}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-text-muted">{additionalInfo}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(method)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3 text-text-secondary transition-colors"
          >
            <PencilSimple className="h-4 w-4" />
          </button>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-danger/20 text-danger transition-colors"
            >
              <Trash className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('paymentMethods.delete' as I18nKey)}</DialogTitle>
                <DialogDescription>
                  {isLastMethod ? t('paymentMethods.deleteWarning' as I18nKey) : '¿Seguro que querés eliminar este medio de pago?'}
                </DialogDescription>
              </DialogHeader>
              
              {isLastMethod && (
                <div className="rounded-xl border border-warning/20 bg-warning/10 p-3 flex gap-3 mt-2">
                  <WarningCircle className="h-5 w-5 text-warning shrink-0" />
                  <p className="text-xs text-warning">Si eliminás este método, no podrás realizar nuevas reservas hasta que agregues otro.</p>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  {t('general.cancel' as I18nKey)}
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isLastMethod ? t('paymentMethods.deleteConfirm' as I18nKey) : t('general.confirm' as I18nKey)}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
