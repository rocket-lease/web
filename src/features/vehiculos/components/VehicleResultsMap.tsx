import { useEffect, useMemo, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { Warning } from '@phosphor-icons/react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  hasGoogleMaps,
} from '@/lib/maps'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'

interface VehicleResultsMapProps {
  vehicles:        GetVehicleResponse[]
  selectedId?:     string | null
  onHoverVehicle?: (id: string | null) => void
  onClickVehicle?: (id: string) => void
  className?:      string
}

/**
 * Mapa con un pin de precio por vehículo individual. Vehículos sin
 * coordenadas se ignoran. Al recibir un `selectedId` el pin cambia a estado
 * "activo" (negro + scale) y el mapa hace pan/zoom hacia él.
 */
export function VehicleResultsMap({
  vehicles, selectedId, onHoverVehicle, onClickVehicle, className,
}: VehicleResultsMapProps) {
  if (!hasGoogleMaps()) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center gap-3 px-8 text-center', className)}>
        <Warning size={40} className="text-warning" weight="duotone" />
        <p className="text-sm text-text-secondary">{t('mapa.noKey')}</p>
      </div>
    )
  }

  return (
    <div className={cn('h-full w-full', className)}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
        <Map
          mapId={GOOGLE_MAPS_MAP_ID}
          defaultCenter={DEFAULT_MAP_CENTER}
          defaultZoom={DEFAULT_MAP_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          onClick={() => onClickVehicle?.('')}
        >
          <VehiclePins
            vehicles={vehicles}
            selectedId={selectedId ?? null}
            onHoverVehicle={onHoverVehicle}
            onClickVehicle={onClickVehicle}
          />
          <FitBoundsController vehicles={vehicles} selectedId={selectedId ?? null} />
        </Map>
      </APIProvider>
    </div>
  )
}

interface VehiclePinsProps {
  vehicles:        GetVehicleResponse[]
  selectedId:      string | null
  onHoverVehicle?: (id: string | null) => void
  onClickVehicle?: (id: string) => void
}

function VehiclePins({ vehicles, selectedId, onHoverVehicle, onClickVehicle }: VehiclePinsProps) {
  return (
    <>
      {vehicles.map(v => {
        if (v.latitude == null || v.longitude == null) return null
        const isSelected = selectedId === v.id
        return (
          <AdvancedMarker
            key={v.id}
            position={{ lat: v.latitude, lng: v.longitude }}
            onClick={() => onClickVehicle?.(v.id)}
            zIndex={isSelected ? 999 : 1}
          >
            <button
              type="button"
              onMouseEnter={() => onHoverVehicle?.(v.id)}
              onMouseLeave={() => onHoverVehicle?.(null)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-150 active:scale-95',
                isSelected
                  ? 'bg-text-primary text-surface-0 scale-110'
                  : 'bg-surface-0 text-text-primary hover:scale-105',
              )}
            >
              {fmt.currency(v.basePriceCents)}
            </button>
          </AdvancedMarker>
        )
      })}
    </>
  )
}

interface FitBoundsControllerProps {
  vehicles:   GetVehicleResponse[]
  selectedId: string | null
}

/**
 * Encadra el viewport del mapa según el contexto:
 *  - Hay un vehículo seleccionado → pan + zoom hacia él.
 *  - Sin selección y hay vehículos con coords → fit bounds que los contenga.
 *  - Sin vehículos → no hace nada (queda el default center).
 *
 * Usa un ref para evitar refit cuando el array de vehículos no cambió en
 * contenido (Google Maps re-renderiza igual con cada nueva instancia).
 */
function FitBoundsController({ vehicles, selectedId }: FitBoundsControllerProps) {
  const map = useMap()
  const lastSignatureRef = useRef<string>('')

  const withCoords = useMemo(
    () => vehicles.filter(v => v.latitude != null && v.longitude != null),
    [vehicles],
  )

  const signature = withCoords.map(v => v.id).sort().join(',')

  useEffect(() => {
    if (!map) return
    if (selectedId) {
      const target = withCoords.find(v => v.id === selectedId)
      if (target && target.latitude != null && target.longitude != null) {
        map.panTo({ lat: target.latitude, lng: target.longitude })
      }
      return
    }
    if (signature === lastSignatureRef.current) return
    lastSignatureRef.current = signature

    if (withCoords.length === 0) return
    if (withCoords.length === 1) {
      const v = withCoords[0]
      map.panTo({ lat: v.latitude!, lng: v.longitude! })
      map.setZoom(13)
      return
    }
    const lats = withCoords.map(v => v.latitude!)
    const lngs = withCoords.map(v => v.longitude!)
    map.fitBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east:  Math.max(...lngs),
      west:  Math.min(...lngs),
    }, 64)
  }, [map, selectedId, signature, withCoords])

  return null
}
