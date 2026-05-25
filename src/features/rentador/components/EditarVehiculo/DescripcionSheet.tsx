import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DescripcionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function DescripcionSheet({ open, onOpenChange, vehicle }: DescripcionSheetProps) {
  const [description, setDescription] = useState(vehicle.description ?? '')

  useEffect(() => {
    if (open) setDescription(vehicle.description ?? '')
  }, [open, vehicle.description])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.description.title')}
      description={t('editVehiculo.section.description.description')}
      isSaving={mutation.isPending}
      onSave={() =>
        mutation.mutate({ description: description.trim() ? description.trim() : null })
      }
    >
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('editVehiculo.field.description')}
        rows={6}
        disabled={mutation.isPending}
        className="min-h-32 w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </SectionSheet>
  )
}
