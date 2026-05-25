import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface PrecioSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function PrecioSheet({ open, onOpenChange, vehicle }: PrecioSheetProps) {
  const [basePrice, setBasePrice] = useState(String((vehicle.basePriceCents ?? 0) / 100))

  useEffect(() => {
    if (open) {
      setBasePrice(String((vehicle.basePriceCents ?? 0) / 100))
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const price = Number(basePrice)
  const canSave = Number.isFinite(price) && price > 0

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.price.title')}
      description={t('editVehiculo.section.price.description')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={() => mutation.mutate({ basePriceCents: Math.round(price * 100) })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.field.basePrice')}
        </label>
        <Input
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          type="number"
          min="0.01"
          step="0.01"
          disabled={mutation.isPending}
        />
        {canSave && (
          <p className="text-xs text-text-muted">
            {fmt.currency(Math.round(price * 100))} / día
          </p>
        )}
      </div>
    </SectionSheet>
  )
}
