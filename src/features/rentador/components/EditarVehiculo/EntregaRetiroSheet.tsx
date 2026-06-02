import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface EntregaRetiroSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function EntregaRetiroSheet({ open, onOpenChange, vehicle }: EntregaRetiroSheetProps) {
  const [deliveryEnabled, setDeliveryEnabled] = useState(vehicle.homeDeliveryEnabled)
  const [deliveryFeeStr, setDeliveryFeeStr] = useState(
    vehicle.homeDeliveryFeeCents != null ? String(vehicle.homeDeliveryFeeCents / 100) : '',
  )
  const [returnEnabled, setReturnEnabled] = useState(vehicle.homeReturnEnabled)
  const [returnFeeStr, setReturnFeeStr] = useState(
    vehicle.homeReturnFeeCents != null ? String(vehicle.homeReturnFeeCents / 100) : '',
  )

  useEffect(() => {
    if (open) {
      setDeliveryEnabled(vehicle.homeDeliveryEnabled)
      setDeliveryFeeStr(vehicle.homeDeliveryFeeCents != null ? String(vehicle.homeDeliveryFeeCents / 100) : '')
      setReturnEnabled(vehicle.homeReturnEnabled)
      setReturnFeeStr(vehicle.homeReturnFeeCents != null ? String(vehicle.homeReturnFeeCents / 100) : '')
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const parseFee = (str: string): number | null => {
    if (str.trim() === '') return null
    const n = parseFloat(str.replace(',', '.'))
    if (Number.isNaN(n) || n < 0) return null
    return Math.round(n * 100)
  }

  const handleSave = () => {
    const homeDeliveryFeeCents = deliveryEnabled ? (parseFee(deliveryFeeStr) ?? 0) : null
    const homeReturnFeeCents = returnEnabled ? (parseFee(returnFeeStr) ?? 0) : null
    mutation.mutate({
      homeDeliveryEnabled: deliveryEnabled,
      homeDeliveryFeeCents,
      homeReturnEnabled: returnEnabled,
      homeReturnFeeCents,
    })
  }

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.entrega.title')}
      description={t('editVehiculo.section.entrega.description')}
      isSaving={mutation.isPending}
      onSave={handleSave}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/8 bg-surface-2 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              {t('editVehiculo.entrega.delivery.toggle')}
            </p>
            <Switch
              checked={deliveryEnabled}
              onCheckedChange={setDeliveryEnabled}
              disabled={mutation.isPending}
            />
          </div>
          {deliveryEnabled && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">
                {t('editVehiculo.entrega.delivery.fee')}
              </label>
              <Input
                value={deliveryFeeStr}
                onChange={(e) => setDeliveryFeeStr(e.target.value.replace(/[^\d.,]/g, ''))}
                inputMode="decimal"
                placeholder={t('editVehiculo.entrega.delivery.feePlaceholder')}
                disabled={mutation.isPending}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-surface-2 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              {t('editVehiculo.entrega.return.toggle')}
            </p>
            <Switch
              checked={returnEnabled}
              onCheckedChange={setReturnEnabled}
              disabled={mutation.isPending}
            />
          </div>
          {returnEnabled && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">
                {t('editVehiculo.entrega.return.fee')}
              </label>
              <Input
                value={returnFeeStr}
                onChange={(e) => setReturnFeeStr(e.target.value.replace(/[^\d.,]/g, ''))}
                inputMode="decimal"
                placeholder={t('editVehiculo.entrega.return.feePlaceholder')}
                disabled={mutation.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </SectionSheet>
  )
}
