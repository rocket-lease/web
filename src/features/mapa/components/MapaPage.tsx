import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  type MapCameraChangedEvent,
} from '@vis.gl/react-google-maps'
import { Crosshair, Warning } from '@phosphor-icons/react'
import type { MapMarker } from '@rocket-lease/contracts'
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  RADIUS_OPTIONS_KM,
  hasGoogleMaps,
} from '@/lib/maps'
import { t } from '@/i18n/es'
import { useMapaRentadoras } from '../hooks/useMapaRentadoras'
import { useNearMe } from '../hooks/useNearMe'
import type { MapSearchParams, Transmission } from '../api/mapa.api'
import { ZoneClusterPin } from './ZoneClusterPin'
import { RentadoraMarker } from './RentadoraMarker'
import { RentadoraMarkerCard } from './RentadoraMarkerCard'

interface Camera {
  bounds: { north: number; south: number; east: number; west: number }
  zoom: number
}

interface Filters {
  transmission?: Transmission
  maxPriceDaily?: number
  isAccessible: boolean
}

/** Capa de marcadores: vive dentro de <Map> para acceder al mapa con useMap. */
function MarkersLayer({
  markers,
  selectedId,
  onSelectRentadora,
}: {
  markers: MapMarker[]
  selectedId: string | null
  onSelectRentadora: (id: string) => void
}) {
  const map = useMap()

  const zoomIntoZone = useCallback(
    (lat: number, lng: number) => {
      if (!map) return
      map.panTo({ lat, lng })
      map.setZoom((map.getZoom() ?? DEFAULT_MAP_ZOOM) + 3)
    },
    [map],
  )

  return (
    <>
      {markers.map((marker) =>
        marker.type === 'zone' ? (
          <AdvancedMarker
            key={marker.clusterId}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onClick={() => zoomIntoZone(marker.latitude, marker.longitude)}
          >
            <ZoneClusterPin marker={marker} />
          </AdvancedMarker>
        ) : (
          <AdvancedMarker
            key={marker.clusterId}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onClick={() => onSelectRentadora(marker.clusterId)}
          >
            <RentadoraMarker
              marker={marker}
              selected={selectedId === marker.clusterId}
            />
          </AdvancedMarker>
        ),
      )}
    </>
  )
}

/** Recentra el mapa imperativamente cuando cambia la posición de "Cerca de mí". */
function RecenterController({
  target,
}: {
  target: { lat: number; lng: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (map && target) {
      map.panTo(target)
      map.setZoom(14)
    }
  }, [map, target])
  return null
}

export function MapaPage() {
  const [camera, setCamera] = useState<Camera | null>(null)
  const [filters, setFilters] = useState<Filters>({ isAccessible: false })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState<number>(RADIUS_OPTIONS_KM[1])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nearMe = useNearMe()

  const nearMeActive = nearMe.status === 'granted' && nearMe.position !== null

  const handleCameraChanged = useCallback((ev: MapCameraChangedEvent) => {
    const { bounds, zoom } = ev.detail
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCamera({
        zoom: Math.round(zoom),
        bounds: {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west,
        },
      })
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Construye los parámetros de búsqueda. En modo "Cerca de mí" usa
  // center+radius; en modo viewport usa el bounding-box de la cámara.
  const params = useMemo<MapSearchParams | null>(() => {
    if (!camera) return null
    const base = {
      zoom: camera.zoom,
      transmission: filters.transmission,
      maxPriceDaily: filters.maxPriceDaily,
      isAccessible: filters.isAccessible || undefined,
    }
    if (nearMeActive && nearMe.position) {
      return { ...base, center: nearMe.position, radiusKm }
    }
    return { ...base, bounds: camera.bounds }
  }, [camera, filters, nearMeActive, nearMe.position, radiusKm])

  const { data, isError } = useMapaRentadoras(params)
  const markers = useMemo(() => data?.markers ?? [], [data])

  const selectedMarker = useMemo(() => {
    if (!selectedId) return null
    const found = markers.find(
      (m) => m.type === 'rentadora' && m.clusterId === selectedId,
    )
    return found && found.type === 'rentadora' ? found : null
  }, [markers, selectedId])

  if (!hasGoogleMaps()) {
    return (
      <div className="flex h-[60dvh] flex-col items-center justify-center gap-3 px-8 text-center">
        <Warning size={40} className="text-warning" weight="duotone" />
        <p className="text-sm text-text-secondary">{t('mapa.noKey')}</p>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col"
      style={{ height: 'calc(100dvh - 8.5rem)' }}
    >
      {/* Barra de filtros — al cambiar, el queryKey cambia y refetchea. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-surface-0 px-4 py-2">
        <select
          aria-label={t('mapa.filter.transmission')}
          value={filters.transmission ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              transmission: (e.target.value || undefined) as
                | Transmission
                | undefined,
            }))
          }
          className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-text-primary"
        >
          <option value="">{t('mapa.filter.transmissionAny')}</option>
          <option value="Manual">Manual</option>
          <option value="Automatico">Automatico</option>
          <option value="Semiautomatico">Semiautomatico</option>
        </select>

        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={t('mapa.filter.maxPrice')}
          value={filters.maxPriceDaily ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              maxPriceDaily: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
          className="w-32 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted"
        />

        <button
          type="button"
          onClick={() =>
            setFilters((f) => ({ ...f, isAccessible: !f.isAccessible }))
          }
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.isAccessible
              ? 'bg-brand-500 text-white'
              : 'bg-surface-2 text-text-secondary'
          }`}
        >
          {t('mapa.filter.accessible')}
        </button>

        <button
          type="button"
          onClick={() => nearMe.locate()}
          className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            nearMeActive
              ? 'bg-client text-white'
              : 'bg-surface-2 text-text-secondary'
          }`}
        >
          <Crosshair size={14} weight="bold" />
          {t('mapa.nearMe')}
        </button>
      </div>

      {/* Selector de radio — visible en modo "Cerca de mí". */}
      {nearMeActive && (
        <div className="flex items-center gap-2 border-b border-white/5 bg-surface-0 px-4 py-2">
          <span className="text-xs text-text-muted">{t('mapa.radius')}</span>
          {RADIUS_OPTIONS_KM.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setRadiusKm(km)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                radiusKm === km
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-2 text-text-secondary'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      )}

      {nearMe.status === 'locating' && (
        <p className="bg-surface-1 px-4 py-1.5 text-xs text-text-muted">
          {t('mapa.locating')}
        </p>
      )}
      {nearMe.status === 'denied' && (
        <p className="bg-surface-1 px-4 py-1.5 text-xs text-warning">
          {t('mapa.gpsDenied')}
        </p>
      )}
      {nearMe.status === 'unavailable' && (
        <p className="bg-surface-1 px-4 py-1.5 text-xs text-warning">
          {t('mapa.gpsUnavailable')}
        </p>
      )}
      {isError && (
        <p className="bg-surface-1 px-4 py-1.5 text-xs text-error">
          {t('mapa.error')}
        </p>
      )}

      <div className="relative flex-1">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={DEFAULT_MAP_CENTER}
            defaultZoom={DEFAULT_MAP_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI
            onCameraChanged={handleCameraChanged}
            onClick={() => setSelectedId(null)}
          >
            <MarkersLayer
              markers={markers}
              selectedId={selectedId}
              onSelectRentadora={setSelectedId}
            />
            <RecenterController
              target={nearMeActive ? nearMe.position : null}
            />
          </Map>
        </APIProvider>

        {markers.length === 0 && camera && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="rounded-full bg-surface-1/95 px-3 py-1.5 text-xs text-text-secondary shadow">
              {t('mapa.empty')}
            </span>
          </div>
        )}

        {selectedMarker && (
          <RentadoraMarkerCard
            marker={selectedMarker}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  )
}
