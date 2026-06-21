import { useState } from 'react'
import { Skeleton } from '@/ui/skeleton'
import { Plus, CreditCard } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { EmptyState } from '@/ui/empty-state'
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
    } catch (_) {}
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('paymentMethods.title' as I18nKey)} showBack />

      <div className="flex-1 p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : paymentMethods?.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={26} weight="regular" className="text-text-muted" />}
            title={t('paymentMethods.empty' as I18nKey)}
            description={t('paymentMethods.emptyHint' as I18nKey)}
            action={
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                {t('paymentMethods.add' as I18nKey)}
              </Button>
            }
          />
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
