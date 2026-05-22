import type { RentadoraMarker as RentadoraMarkerData } from '@rocket-lease/contracts'
import { Car } from '@phosphor-icons/react'
import { fmt } from '@/lib/formatters'

interface RentadoraMarkerProps {
  marker: RentadoraMarkerData
  selected: boolean
}

/** Pin de una rentadora: cantidad de autos disponibles + precio desde. */
export function RentadoraMarker({ marker, selected }: RentadoraMarkerProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-lg ring-2 transition-transform ${
          selected
            ? 'scale-110 bg-brand-500 text-white ring-white'
            : 'bg-surface-2 text-text-primary ring-white/70'
        }`}
      >
        <Car size={14} weight="duotone" />
        <span className="text-xs font-bold leading-none">
          {marker.availableVehicleCount}
        </span>
        <span className="text-[11px] font-medium leading-none opacity-80">
          {fmt.currency(marker.minPriceCents)}
        </span>
      </div>
      <div
        className={`-mt-px h-2 w-2 rotate-45 ${
          selected ? 'bg-brand-500' : 'bg-surface-2'
        }`}
      />
    </div>
  )
}
