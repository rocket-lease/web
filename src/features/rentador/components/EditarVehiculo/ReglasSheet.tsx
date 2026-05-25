import { useEffect, useState } from 'react'
import type { GetVehicleResponse, ReservationRuleSet } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'
import { ReservationRuleSetSelector } from '../ReservationRuleSetSelector'

interface ReglasSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
  onRequestDeletePrivate: (privateRuleSet: ReservationRuleSet) => void
  onRequestSwitchToShared: (sharedId: string | undefined, privateRuleSet: ReservationRuleSet) => void
}

export function ReglasSheet({
  open,
  onOpenChange,
  vehicle,
  onRequestDeletePrivate,
  onRequestSwitchToShared,
}: ReglasSheetProps) {
  const initialId =
    (vehicle as GetVehicleResponse & { reservationRuleSetId?: string }).reservationRuleSetId
  const [ruleSetId, setRuleSetId] = useState<string | undefined>(initialId)

  useEffect(() => {
    if (open) setRuleSetId(initialId)
  }, [open, initialId])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.rules.title')}
      isSaving={mutation.isPending}
      onSave={() => mutation.mutate({ reservationRuleSetId: ruleSetId ?? null })}
    >
      <ReservationRuleSetSelector
        selectedId={ruleSetId}
        onSelect={(id) => setRuleSetId(id)}
        disabled={mutation.isPending}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.brand} ${vehicle.model}`}
        onRequestDeletePrivate={onRequestDeletePrivate}
        onRequestSwitchToShared={onRequestSwitchToShared}
      />
    </SectionSheet>
  )
}
