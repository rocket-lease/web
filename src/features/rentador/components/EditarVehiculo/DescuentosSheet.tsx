import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import {
  DiscountTiersEditor,
  areDiscountTiersValid,
  normalizeDiscountTiers,
} from '../DiscountTiersEditor'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DescuentosSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function DescuentosSheet({
  open,
  onOpenChange,
  vehicle,
}: DescuentosSheetProps) {
  const [discountTiers, setDiscountTiers] = useState(
    vehicle.discountTiers ?? [],
  )

  useEffect(() => {
    if (open) {
      setDiscountTiers(vehicle.discountTiers ?? [])
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const canSave = areDiscountTiersValid(discountTiers)

  const maxDiscount =
    discountTiers.length > 0
      ? Math.max(
          ...discountTiers.map(
            (tier) => tier.discountPercentage,
          ),
        )
      : null

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.discounts.title')}
      description={t('editVehiculo.section.discounts.description')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={() =>
        mutation.mutate({
          discountTiers:
            normalizeDiscountTiers(discountTiers),
        })
      }
    >
      <div className="rounded-xl border border-white/8 bg-surface-2 p-4">
        <p className="text-sm font-medium text-text-primary">
            {t('editVehiculo.section.discounts.howItWorks')}
        </p>

        <p className="mt-2 text-sm text-text-muted">
            {t('editVehiculo.section.discounts.explanation')}
        </p>

        <ul className="mt-3 space-y-1 text-xs text-text-muted">
            <li>
            • {t('editVehiculo.section.discounts.bestDiscountOnly')}
            </li>
            <li>
            • {t('editVehiculo.section.discounts.mustIncrease')}
            </li>
            <li>
            • {t('editVehiculo.section.discounts.maxDiscountLimit')}
            </li>
        </ul>

        {maxDiscount !== null && (
            <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-500/10 px-3 py-2">
            <p className="text-sm font-medium text-brand-400">
                {t('editVehiculo.section.discounts.maxDiscountAvailable')
                .replace('{discount}', String(maxDiscount))}
            </p>
            </div>
        )}
        </div>

      <DiscountTiersEditor
        value={discountTiers}
        onChange={setDiscountTiers}
        disabled={mutation.isPending}
      />
    </SectionSheet>
  )
}