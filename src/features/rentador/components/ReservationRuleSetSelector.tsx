import { useState } from 'react'
import { Lock, Pencil, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
  vehicleId?: string
  vehicleName?: string
}

const CREATE_NEW_VALUE = '__create_new__'
const PRIVATE_PREFIX = 'private:'
const SHARED_PREFIX = 'shared:'
const NONE_VALUE = 'none'

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
  const privateRuleSetQuery = usePrivateRuleSetForVehicle(vehicleId)
  const privateRuleSet = privateRuleSetQuery.data ?? null
  const deleteMutation = useDeleteReservationRuleSet()

  const activeValue = privateRuleSet
    ? `${PRIVATE_PREFIX}${privateRuleSet.id}`
    : selectedId
      ? `${SHARED_PREFIX}${selectedId}`
      : NONE_VALUE

  const activeRuleSet = privateRuleSet ?? ruleSets.find((s) => s.id === selectedId)

  const applyShared = (sharedId: string | undefined) => {
    if (privateRuleSet) {
      const ok = window.confirm(
        'Las reglas particulares de este vehículo van a eliminarse para aplicar el set compartido. ¿Continuar?',
      )
      if (!ok) return
      deleteMutation.mutate(privateRuleSet.id, {
        onSuccess: () => onSelect(sharedId),
      })
      return
    }
    onSelect(sharedId)
  }

  const handleValueChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setCreateDialogOpen(true)
      return
    }
    if (value.startsWith(PRIVATE_PREFIX)) {
      // Ya está activa; no-op.
      return
    }
    if (value === NONE_VALUE) {
      applyShared(undefined)
      return
    }
    if (value.startsWith(SHARED_PREFIX)) {
      applyShared(value.slice(SHARED_PREFIX.length))
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        {t('reservationRules.title')}
      </label>

      <Select
        value={activeValue}
        onValueChange={handleValueChange}
        disabled={disabled || ruleSetsQuery.isLoading}
      >
        <SelectTrigger>
          <SelectValue>
            {privateRuleSet ? (
              <span className="flex items-center gap-1.5 text-text-primary">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                {privateRuleSet.name}
              </span>
            ) : (
              activeRuleSet?.name ?? t('reservationRules.selector.none')
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {privateRuleSet && (
            <>
              <SelectGroup>
                <SelectLabel>Reglas particulares del vehículo</SelectLabel>
                <SelectItem value={`${PRIVATE_PREFIX}${privateRuleSet.id}`}>
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-amber-400" />
                    {privateRuleSet.name}
                  </span>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
            </>
          )}
          <SelectGroup>
            <SelectLabel>Sets compartidos</SelectLabel>
            {ruleSets.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-text-muted">
                Todavía no tenés sets compartidos.
              </div>
            ) : (
              ruleSets.map((set) => (
                <SelectItem key={set.id} value={`${SHARED_PREFIX}${set.id}`}>
                  <div className="flex flex-col">
                    <span>{set.name}</span>
                    <span className="text-xs text-text-muted">{set.description || ''}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectItem value={NONE_VALUE}>{t('reservationRules.selector.none')}</SelectItem>
            <SelectItem value={CREATE_NEW_VALUE}>
              <span className="font-medium text-brand-400">
                {t('reservationRules.selector.createNew')}
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {activeRuleSet && (
        <div className="rounded-lg bg-surface-2 p-3 text-xs text-text-secondary">
          <p className="font-medium text-text-primary">{activeRuleSet.name}</p>
          <p className="mt-1">
            Cancelación: <span className="font-medium">{getCancellationPolicyLabel(activeRuleSet.cancellationPolicy)}</span>
          </p>
          <p>
            Seña: <span className="font-medium">{getDepositLabel(activeRuleSet.depositPercentage)}</span>
          </p>
          <p>
            Kilometraje: <span className="font-medium">{formatMaxKilometrage(activeRuleSet.maxKilometrage)}</span>
          </p>
          <p>
            Tiempo de alquiler: <span className="font-medium">{formatRentalTimeConstraints(activeRuleSet.rentalTimeConstraints)}</span>
          </p>
          {privateRuleSet && (
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
          )}
        </div>
      )}

      <CreateRuleSetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        vehicleIdForPrivateOption={privateRuleSet ? undefined : vehicleId}
        vehicleNameForScopeDialog={vehicleName}
        onCreated={(response, scope) => {
          // Sólo autoseleccionamos el shared; el privado ya queda atado por el endpoint.
          if (scope === 'SHARED') {
            onSelect(response.id)
          }
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
