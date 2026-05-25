import { useEffect, useState } from 'react'
import type { Characteristic, GetVehicleResponse } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { ALL_CHARACTERISTICS, getCharacteristicLabel } from '@/features/vehiculos/utils/characteristics'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface CaracteristicasSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function CaracteristicasSheet({ open, onOpenChange, vehicle }: CaracteristicasSheetProps) {
  const [selected, setSelected] = useState<Characteristic[]>(vehicle.characteristics ?? [])

  useEffect(() => {
    if (open) setSelected(vehicle.characteristics ?? [])
  }, [open, vehicle.characteristics])

  const toggle = (char: Characteristic) => {
    setSelected((prev) => (prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]))
  }

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.features.title')}
      isSaving={mutation.isPending}
      onSave={() => mutation.mutate({ characteristics: selected })}
    >
      <div className="flex flex-wrap gap-2">
        {ALL_CHARACTERISTICS.map((char) => {
          const isSelected = selected.includes(char)
          return (
            <button
              key={char}
              type="button"
              onClick={() => toggle(char)}
              disabled={mutation.isPending}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3 border border-white/5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getCharacteristicLabel(char)}
            </button>
          )
        })}
      </div>
    </SectionSheet>
  )
}
