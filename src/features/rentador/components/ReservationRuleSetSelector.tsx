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

interface ReservationRuleSetSelectorProps {
  selectedId?: string
  onSelect: (id: string | undefined) => void
  disabled?: boolean
}

export function ReservationRuleSetSelector({
  selectedId,
  onSelect,
  disabled = false,
}: ReservationRuleSetSelectorProps) {
  const ruleSetsQuery = useReservationRuleSets()
  const ruleSets = ruleSetsQuery.data ?? []
  const selectedRuleSet = ruleSets.find((set) => set.id === selectedId)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        {t('reservationRules.title')}
      </label>
      <Select
        value={selectedId ?? 'Sin reglas asignadas'}
        onValueChange={(value) => onSelect(value === 'none' ? undefined : value)}
        disabled={disabled || ruleSetsQuery.isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sin reglas asignadas">{selectedRuleSet?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            {t('general.cancel')}
          </SelectItem>
          {ruleSets.map((set) => (
            <SelectItem key={set.id} value={set.id}>
              <div className="flex flex-col">
                <span>{set.name}</span>
                <span className="text-xs text-text-muted">{set.description || ''}</span>
              </div>
            </SelectItem>
          ))}
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
            Seña: <span className="font-medium">{getDepositLabel(selectedRuleSet.deposit)}</span>
          </p>
          <p>
            Kilometraje: <span className="font-medium">{formatMaxKilometrage(selectedRuleSet.maxKilometrage)}</span>
          </p>
          <p>
            Tiempo de alquiler: <span className="font-medium">{formatRentalTimeConstraints(selectedRuleSet.rentalTimeConstraints)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
