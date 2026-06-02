import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DisponibilidadSheetProps {
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

export function DisponibilidadSheet({ open, onOpenChange, vehicle }: DisponibilidadSheetProps) {
  const [availableFrom, setAvailableFrom] = useState(vehicle.availableFrom ?? '')
  const [enabled, setEnabled] = useState(Boolean(vehicle.enabled))
  const [basePrice, setBasePrice] = useState(String((vehicle.basePriceCents ?? 0) / 100))
  const [autoAccept, setAutoAccept] = useState<boolean | null>(vehicle.autoAccept ?? null)

  useEffect(() => {
    if (open) {
      setAvailableFrom(vehicle.availableFrom ?? '')
      setEnabled(Boolean(vehicle.enabled))
      setBasePrice(String((vehicle.basePriceCents ?? 0) / 100))
      setAutoAccept(vehicle.autoAccept ?? null)
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const price = Number(basePrice)
  const canSave =
    availableFrom.length > 0 && Number.isFinite(price) && price > 0

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.availability.title')}
      description={t('editVehiculo.section.availability.description')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={() =>
        mutation.mutate({
          availableFrom,
          enabled,
          basePriceCents: Math.round(price * 100),
          autoAccept,
        })
      }
    >
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
