import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DisponibilidadSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function DisponibilidadSheet({ open, onOpenChange, vehicle }: DisponibilidadSheetProps) {
  const [availableFrom, setAvailableFrom] = useState(vehicle.availableFrom ?? '')
  const [enabled, setEnabled] = useState(Boolean(vehicle.enabled))

  useEffect(() => {
    if (open) {
      setAvailableFrom(vehicle.availableFrom ?? '')
      setEnabled(Boolean(vehicle.enabled))
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const canSave = availableFrom.length > 0

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.availability.title')}
      description={t('editVehiculo.section.availability.description')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={() => mutation.mutate({ availableFrom, enabled })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.field.availableFrom')}
        </label>
        <Input
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          type="date"
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface-2 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {t('editVehiculo.field.enabled')}
          </p>
          <p className="text-xs text-text-muted">
            {enabled
              ? t('editVehiculo.section.availability.enabledHint')
              : t('editVehiculo.section.availability.disabledHint')}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={mutation.isPending}
        />
      </div>
    </SectionSheet>
  )
}
