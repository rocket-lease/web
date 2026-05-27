import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/ui/drawer'
import { t, type I18nKey } from '@/i18n/es'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { PaymentMethodCard } from './PaymentMethodCard'
import { PaymentMethodForm } from './PaymentMethodForm'
import type { CreateSavedPaymentMethod, SavedPaymentMethod, UpdateSavedPaymentMethod } from '@rocket-lease/contracts'

export function PaymentMethodsPage() {
  const { 
    paymentMethods, 
    isLoading, 
    createPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod,
    isCreating,
    isUpdating,
    isDeleting 
  } = usePaymentMethods()
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<SavedPaymentMethod | null>(null)

  const handleOpenCreate = () => {
    setEditingMethod(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (method: SavedPaymentMethod) => {
    setEditingMethod(method)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setEditingMethod(null), 300) // Clear after animation
  }

  const handleSubmit = async (data: CreateSavedPaymentMethod | UpdateSavedPaymentMethod) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod({ id: editingMethod.id, data: data as UpdateSavedPaymentMethod })
      } else {
        await createPaymentMethod(data as CreateSavedPaymentMethod)
      }
      handleCloseDrawer()
    } catch (_error) {
      // handled by hook
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader title={t('paymentMethods.title' as I18nKey)} showBack />

      <div className="flex-1 p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-sm text-text-muted">{t('general.loading' as I18nKey)}</div>
        ) : paymentMethods?.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12 px-4">
            <div className="h-16 w-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-brand-400" />
            </div>
            <p className="text-text-primary font-medium mb-1">{t('paymentMethods.empty' as I18nKey)}</p>
            <p className="text-sm text-text-muted mb-6">Agregá una tarjeta o billetera virtual para pagar tus reservas.</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t('paymentMethods.add' as I18nKey)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paymentMethods?.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isLastMethod={paymentMethods.length === 1}
                onEdit={handleOpenEdit}
                onDelete={deletePaymentMethod}
                isDeleting={isDeleting}
              />
            ))}

            <Button onClick={handleOpenCreate} variant="outline" className="mt-2 w-full">
              <Plus className="h-4 w-4 mr-2" />
              {t('paymentMethods.add' as I18nKey)}
            </Button>
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Método de pago</DrawerTitle>
          <DrawerDescription className="sr-only">Formulario para crear o editar un método de pago</DrawerDescription>
          <div className="p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">
              {editingMethod ? t('paymentMethods.edit' as I18nKey) : t('paymentMethods.add' as I18nKey)}
            </h2>
            <PaymentMethodForm 
              initialData={editingMethod}
              onSubmit={handleSubmit}
              onCancel={handleCloseDrawer}
              isLoading={isCreating || isUpdating}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
