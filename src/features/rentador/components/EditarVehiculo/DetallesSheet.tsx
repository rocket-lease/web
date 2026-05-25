import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DetallesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

type AutoAcceptOption = 'inherit' | 'on' | 'off'

const AUTO_ACCEPT_OPTIONS: ReadonlyArray<{ key: AutoAcceptOption; labelKey: string }> = [
  { key: 'inherit', labelKey: 'vehiculo.autoAccept.opcion.heredar' },
  { key: 'on', labelKey: 'vehiculo.autoAccept.opcion.si' },
  { key: 'off', labelKey: 'vehiculo.autoAccept.opcion.no' },
]

function toAutoAcceptOption(value: boolean | null | undefined): AutoAcceptOption {
  if (value === true) return 'on'
  if (value === false) return 'off'
  return 'inherit'
}

function fromAutoAcceptOption(option: AutoAcceptOption): boolean | null {
  if (option === 'on') return true
  if (option === 'off') return false
  return null
}

export function DetallesSheet({ open, onOpenChange, vehicle }: DetallesSheetProps) {
  const [color, setColor] = useState(vehicle.color ?? '')
  const [mileage, setMileage] = useState(String(vehicle.mileage ?? ''))
  const [isAccessible, setIsAccessible] = useState(Boolean(vehicle.isAccessible))
  const [autoAccept, setAutoAccept] = useState<boolean | null>(vehicle.autoAccept ?? null)

  useEffect(() => {
    if (open) {
      setColor(vehicle.color ?? '')
      setMileage(String(vehicle.mileage ?? ''))
      setIsAccessible(Boolean(vehicle.isAccessible))
      setAutoAccept(vehicle.autoAccept ?? null)
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const handleSave = () => {
    const mileageNumber = Number(mileage)
    if (!Number.isFinite(mileageNumber) || mileageNumber < 0) {
      return
    }
    mutation.mutate({
      color: color.trim(),
      mileage: mileageNumber,
      isAccessible,
      autoAccept,
    })
  }

  const canSave = color.trim().length > 0 && /^\d+$/.test(mileage) && Number(mileage) >= 0

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.details.title')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={handleSave}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.field.color')}
        </label>
        <Input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder={t('editVehiculo.field.color')}
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.field.mileage')}
        </label>
        <Input
          value={mileage}
          onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          placeholder={t('editVehiculo.field.mileage')}
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface-2 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {t('editVehiculo.field.isAccessible')}
          </p>
        </div>
        <Switch
          checked={isAccessible}
          onCheckedChange={setIsAccessible}
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('vehiculo.autoAccept.label')}
        </label>
        <p className="text-xs text-text-muted">{t('vehiculo.autoAccept.descripcion')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {AUTO_ACCEPT_OPTIONS.map((option) => {
            const selected = toAutoAcceptOption(autoAccept) === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setAutoAccept(fromAutoAcceptOption(option.key))}
                disabled={mutation.isPending}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-brand-500 bg-brand-500/15 text-brand-400'
                    : 'border-white/8 bg-surface-2 text-text-secondary hover:border-brand-600/50 hover:text-brand-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {t(option.labelKey as Parameters<typeof t>[0])}
              </button>
            )
          })}
        </div>
      </div>
    </SectionSheet>
  )
}
