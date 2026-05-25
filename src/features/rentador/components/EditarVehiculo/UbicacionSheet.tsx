import { useEffect, useState } from 'react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { t } from '@/i18n/es'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'
import { LocationPicker } from '../LocationPicker'

interface UbicacionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function UbicacionSheet({ open, onOpenChange, vehicle }: UbicacionSheetProps) {
  const [province, setProvince] = useState(vehicle.province ?? '')
  const [city, setCity] = useState(vehicle.city ?? '')
  const [address, setAddress] = useState(vehicle.address ?? '')
  const [latitude, setLatitude] = useState<number | null>(vehicle.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(vehicle.longitude ?? null)

  useEffect(() => {
    if (open) {
      setProvince(vehicle.province ?? '')
      setCity(vehicle.city ?? '')
      setAddress(vehicle.address ?? '')
      setLatitude(vehicle.latitude ?? null)
      setLongitude(vehicle.longitude ?? null)
    }
  }, [open, vehicle])

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const hasCoordinates = latitude !== null && longitude !== null
  const canSave = province.trim().length > 0 && city.trim().length > 0 && hasCoordinates

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.location.title')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={() =>
        mutation.mutate({
          province: province.trim(),
          city: city.trim(),
          ...(hasCoordinates
            ? { address: address.trim(), latitude, longitude }
            : {}),
        })
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            {t('editVehiculo.field.city')}
          </label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            {t('editVehiculo.field.province')}
          </label>
          <Input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      <LocationPicker
        approximate={false}
        value={hasCoordinates ? { latitude: latitude!, longitude: longitude!, address, province, city } : null}
        onChange={(loc) => {
          setLatitude(loc.latitude)
          setLongitude(loc.longitude)
          setAddress(loc.address)
          setProvince(loc.province)
          setCity(loc.city)
        }}
      />
    </SectionSheet>
  )
}
