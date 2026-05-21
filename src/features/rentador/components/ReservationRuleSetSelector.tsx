import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { t } from '@/i18n/es'
import { useReservationRuleSets } from '@/features/rentador/hooks/useReservationRules'
import {
  getCancellationPolicyLabel,
  getDepositLabel,
  formatMaxKilometrage,
  formatRentalTimeConstraints,
} from '@/features/vehiculos/utils/rules-formatter'
import { CreateRuleSetDialog } from './CreateRuleSetDialog'

interface ReservationRuleSetSelectorProps {
  selectedId?: string
  onSelect: (id: string | undefined) => void
  disabled?: boolean
  /**
   * Vehículo al que pertenece este selector. Si está presente, la opción
   * "+ Crear nuevo set" abre el diálogo con la opción de privado/compartido (US-49).
   */
  vehicleId?: string
  vehicleName?: string
}

const CREATE_NEW_VALUE = '__create_new__'

export function ReservationRuleSetSelector({
  selectedId,
  onSelect,
  disabled = false,
  vehicleId,
  vehicleName,
}: ReservationRuleSetSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const ruleSetsQuery = useReservationRuleSets()
  const ruleSets = ruleSetsQuery.data ?? []
  const selectedRuleSet = ruleSets.find((set) => set.id === selectedId)

  const handleValueChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setCreateDialogOpen(true)
      return
    }
    onSelect(value === 'none' ? undefined : value)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        {t('reservationRules.title')}
      </label>
      <Select
        value={selectedId ?? 'none'}
        onValueChange={handleValueChange}
        disabled={disabled || ruleSetsQuery.isLoading}
      >
        <SelectTrigger>
          <SelectValue>
            {selectedRuleSet?.name ?? t('reservationRules.selector.none')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t('reservationRules.selector.none')}</SelectItem>
          {ruleSets.map((set) => (
            <SelectItem key={set.id} value={set.id}>
              <div className="flex flex-col">
                <span>{set.name}</span>
                <span className="text-xs text-text-muted">{set.description || ''}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value={CREATE_NEW_VALUE}>
            <span className="font-medium text-brand-400">
              {t('reservationRules.selector.createNew')}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      {selectedRuleSet && (
        <div className="rounded-lg bg-surface-2 p-3 text-xs text-text-secondary">
          <p className="font-medium text-text-primary">
            {selectedRuleSet.name}
          </p>
          <p className="mt-1">
            Cancelación: <span className="font-medium">{getCancellationPolicyLabel(selectedRuleSet.cancellationPolicy)}</span>
          </p>
          <p>
            Seña: <span className="font-medium">{getDepositLabel(selectedRuleSet.depositPercentage)}</span>
          </p>
          <p>
            Kilometraje: <span className="font-medium">{formatMaxKilometrage(selectedRuleSet.maxKilometrage)}</span>
          </p>
          <p>
            Tiempo de alquiler: <span className="font-medium">{formatRentalTimeConstraints(selectedRuleSet.rentalTimeConstraints)}</span>
          </p>
        </div>
      )}

      <CreateRuleSetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        vehicleIdForPrivateOption={vehicleId}
        vehicleNameForScopeDialog={vehicleName}
        onCreated={(response, scope) => {
          // Si el set fue creado como compartido, se autoselecciona.
          // Si fue privado, el vehículo ya queda atado vía el endpoint del api,
          // pero también lo dejamos autoseleccionado para feedback inmediato.
          onSelect(response.id)
          // scope se ignora a nivel UI — la lógica viva en api/web está en el payload.
          void scope
        }}
      />
    </div>
  )
}
