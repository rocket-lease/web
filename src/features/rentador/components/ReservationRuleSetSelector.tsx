import { useState } from 'react'
import { Lock, Pencil, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import {
  useReservationRuleSets,
  usePrivateRuleSetForVehicle,
  useDeleteReservationRuleSet,
} from '@/features/rentador/hooks/useReservationRules'
import {
  getCancellationPolicyLabel,
  getDepositLabel,
  formatMaxKilometrage,
  formatRentalTimeConstraints,
} from '@/features/vehiculos/utils/rules-formatter'
import { CreateRuleSetDialog } from './CreateRuleSetDialog'
import { EditRuleSetDialog } from './EditRuleSetDialog'

interface ReservationRuleSetSelectorProps {
  selectedId?: string
  onSelect: (id: string | undefined) => void
  disabled?: boolean
  /**
   * Vehículo al que pertenece este selector. Si está presente, la opción
   * "+ Crear nuevo set" abre el diálogo con la opción de privado/compartido.
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
  const [editPrivateOpen, setEditPrivateOpen] = useState(false)
  const ruleSetsQuery = useReservationRuleSets()
  const ruleSets = ruleSetsQuery.data ?? []
  const selectedRuleSet = ruleSets.find((set) => set.id === selectedId)
  const privateRuleSetQuery = usePrivateRuleSetForVehicle(vehicleId)
  const privateRuleSet = privateRuleSetQuery.data ?? null
  const deleteMutation = useDeleteReservationRuleSet()

  const handleValueChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setCreateDialogOpen(true)
      return
    }
    onSelect(value === 'none' ? undefined : value)
  }

  return (
    <div className="space-y-2">
      {privateRuleSet ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-primary">
                {t('reservationRules.scope.privateNote')}: {privateRuleSet.name}
              </p>
              <p className="mt-1 text-text-secondary">
                Cancelación: <span className="font-medium">{getCancellationPolicyLabel(privateRuleSet.cancellationPolicy)}</span>
                {' · '}
                Seña: <span className="font-medium">{getDepositLabel(privateRuleSet.depositPercentage)}</span>
              </p>
              <p className="text-text-secondary">
                Kilometraje: <span className="font-medium">{formatMaxKilometrage(privateRuleSet.maxKilometrage)}</span>
                {' · '}
                Tiempo: <span className="font-medium">{formatRentalTimeConstraints(privateRuleSet.rentalTimeConstraints)}</span>
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditPrivateOpen(true)}
                  disabled={disabled}
                >
                  <Pencil className="h-3 w-3" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm('¿Eliminar las reglas particulares de este vehículo?')) {
                      deleteMutation.mutate(privateRuleSet.id)
                    }
                  }}
                  disabled={disabled || deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" /> Eliminar
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-text-muted">
                Las reglas particulares siempre tienen prioridad sobre cualquier set compartido.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <label className="block text-sm font-medium text-text-secondary">
            {t('reservationRules.selector.sharedLabel')}
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
              <p className="font-medium text-text-primary">{selectedRuleSet.name}</p>
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
        </>
      )}

      <CreateRuleSetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        vehicleIdForPrivateOption={privateRuleSet ? undefined : vehicleId}
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

      {privateRuleSet && (
        <EditRuleSetDialog
          ruleSet={privateRuleSet}
          open={editPrivateOpen}
          onOpenChange={setEditPrivateOpen}
        />
      )}
    </div>
  )
}
