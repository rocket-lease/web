import { useEffect, useState } from 'react'
import type { Characteristic, GetVehicleResponse } from '@rocket-lease/contracts'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { t } from '@/i18n/es'
import { ALL_CHARACTERISTICS, getCharacteristicLabel } from '@/features/vehiculos/utils/characteristics'
import { LocationPicker } from '../LocationPicker'
import { SectionSheet } from './SectionSheet'
import { useUpdateVehicleSection } from './useUpdateVehicleSection'

interface DetallesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: GetVehicleResponse
}

export function DetallesSheet({ open, onOpenChange, vehicle }: DetallesSheetProps) {
  const [color, setColor] = useState(vehicle.color ?? '')
  const [mileage, setMileage] = useState(String(vehicle.mileage ?? ''))
  const [isAccessible, setIsAccessible] = useState(Boolean(vehicle.isAccessible))
  const [province, setProvince] = useState(vehicle.province ?? '')
  const [city, setCity] = useState(vehicle.city ?? '')
  const [address, setAddress] = useState(vehicle.address ?? '')
  const [latitude, setLatitude] = useState<number | null>(vehicle.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(vehicle.longitude ?? null)
  const [description, setDescription] = useState(vehicle.description ?? '')
  const [characteristics, setCharacteristics] = useState<Characteristic[]>(vehicle.characteristics ?? [])

  useEffect(() => {
    if (open) {
      setColor(vehicle.color ?? '')
      setMileage(String(vehicle.mileage ?? ''))
      setIsAccessible(Boolean(vehicle.isAccessible))
      setProvince(vehicle.province ?? '')
      setCity(vehicle.city ?? '')
      setAddress(vehicle.address ?? '')
      setLatitude(vehicle.latitude ?? null)
      setLongitude(vehicle.longitude ?? null)
      setDescription(vehicle.description ?? '')
      setCharacteristics(vehicle.characteristics ?? [])
    }
  }, [open, vehicle])

  const toggleCharacteristic = (char: Characteristic) => {
    setCharacteristics((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char],
    )
  }

  const mutation = useUpdateVehicleSection({
    vehicleId: vehicle.id,
    onSuccess: () => onOpenChange(false),
  })

  const mileageNumber = Number(mileage)
  const hasCoordinates = latitude !== null && longitude !== null
  const canSave =
    color.trim().length > 0 &&
    /^\d+$/.test(mileage) &&
    mileageNumber >= 0 &&
    province.trim().length > 0 &&
    city.trim().length > 0 &&
    hasCoordinates

  const handleSave = () => {
    mutation.mutate({
      color: color.trim(),
      mileage: mileageNumber,
      isAccessible,
      province: province.trim(),
      city: city.trim(),
      ...(hasCoordinates
        ? { address: address.trim(), latitude, longitude }
        : {}),
      description: description.trim() ? description.trim() : null,
      characteristics,
    })
  }

  return (
    <SectionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVehiculo.section.details.title')}
      isSaving={mutation.isPending}
      canSave={canSave}
      onSave={handleSave}
    >
      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface-2 px-4 py-3">
        <p className="text-sm font-medium text-text-primary">
          {t('editVehiculo.field.isAccessible')}
        </p>
        <Switch
          checked={isAccessible}
          onCheckedChange={setIsAccessible}
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-white/8 bg-surface-2 p-4">
        <p className="text-sm font-semibold text-text-primary">
          {t('editVehiculo.section.location.title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
              {t('editVehiculo.field.city')}
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
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
          value={
            hasCoordinates
              ? { latitude: latitude!, longitude: longitude!, address, province, city }
              : null
          }
          onChange={(loc) => {
            setLatitude(loc.latitude)
            setLongitude(loc.longitude)
            setAddress(loc.address)
            setProvince(loc.province)
            setCity(loc.city)
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.section.description.title')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('editVehiculo.field.description')}
          rows={4}
          disabled={mutation.isPending}
          className="min-h-24 w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t('editVehiculo.section.features.title')}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_CHARACTERISTICS.map((char) => {
            const isSelected = characteristics.includes(char)
            return (
              <button
                key={char}
                type="button"
                onClick={() => toggleCharacteristic(char)}
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
      </div>
    </SectionSheet>
  )
}
