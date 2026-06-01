import { useEffect, useMemo, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { Warning, NavigationArrow } from '@phosphor-icons/react'
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
import { useNearMe } from '@/features/mapa/hooks/useNearMe'

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
  const nearMe = useNearMe()

  if (!hasGoogleMaps()) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center gap-3 px-8 text-center', className)}>
        <Warning size={40} className="text-warning" weight="duotone" />
        <p className="text-sm text-text-secondary">{t('mapa.noKey')}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
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
          <FitBoundsController
            vehicles={vehicles}
            selectedId={selectedId ?? null}
            nearMePosition={nearMe.position}
          />
        </Map>
      </APIProvider>

      {/* Botón "ubicación" arriba a la derecha, sobre el mapa. */}
      <button
        type="button"
        onClick={() => nearMe.locate()}
        aria-label="Centrar en mi ubicación"
        disabled={nearMe.status === 'locating'}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-0 text-text-primary shadow-lg border border-white/8 hover:bg-surface-1 transition-colors active:scale-95 disabled:opacity-60"
      >
        <NavigationArrow
          size={18}
          weight={nearMe.status === 'granted' ? 'fill' : 'regular'}
          className={nearMe.status === 'granted' ? 'text-brand-400' : 'text-text-secondary'}
        />
      </button>
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
  vehicles:       GetVehicleResponse[]
  selectedId:     string | null
  nearMePosition: { lat: number; lng: number } | null
}

/**
 * Encadra el viewport del mapa según el contexto, en orden de prioridad:
 *  - "Cerca mío" recién resuelta → pan + zoom hacia la posición del user.
 *  - Hay un vehículo seleccionado → pan hacia él.
 *  - Sin selección y hay vehículos con coords → fit bounds que los contenga.
 *  - Sin vehículos → no hace nada (queda el default center).
 *
 * Usa refs para detectar cuándo hay un cambio real (firma del set de
 * vehículos o coords nuevas de nearMe) y evitar refits redundantes.
 */
function FitBoundsController({ vehicles, selectedId, nearMePosition }: FitBoundsControllerProps) {
  const map = useMap()
  const lastSignatureRef = useRef<string>('')
  const lastNearMeKeyRef = useRef<string>('')

  const withCoords = useMemo(
    () => vehicles.filter(v => v.latitude != null && v.longitude != null),
    [vehicles],
  )

  const signature = withCoords.map(v => v.id).sort().join(',')
  const nearMeKey = nearMePosition ? `${nearMePosition.lat},${nearMePosition.lng}` : ''

  useEffect(() => {
    if (!map) return
    // "Cerca mío" pisa cualquier otra prioridad cuando es nueva.
    if (nearMePosition && nearMeKey !== lastNearMeKeyRef.current) {
      lastNearMeKeyRef.current = nearMeKey
      map.panTo(nearMePosition)
      map.setZoom(14)
      return
    }
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
  }, [map, selectedId, signature, withCoords, nearMePosition, nearMeKey])

  return null
}
