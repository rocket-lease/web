import type { ZoneClusterMarker } from '@rocket-lease/contracts'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

interface ZoneClusterPinProps {
  marker: ZoneClusterMarker
}

/**
 * Pin de zona (zoom bajo): agrupa autos de varias rentadoras. Al tocarlo, el
 * mapa hace zoom-in y a mayor zoom el cluster se separa por rentadora.
 */
export function ZoneClusterPin({ marker }: ZoneClusterPinProps) {
  return (
    <div className="flex flex-col items-center" title={t('mapa.zone.tapToZoom')}>
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-brand-500 text-white shadow-lg ring-2 ring-white/80">
        <span className="text-sm font-bold leading-none">
          {marker.vehicleCount}
        </span>
        <span className="text-[8px] uppercase leading-tight opacity-90">
          {t('mapa.marker.vehicles')}
        </span>
      </div>
      <span className="mt-1 rounded-full bg-surface-2/95 px-2 py-0.5 text-[10px] font-medium text-text-secondary shadow">
        {fmt.currency(marker.minPriceCents)}
      </span>
    </div>
  )
}
