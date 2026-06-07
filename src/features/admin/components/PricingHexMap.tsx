import { useEffect, useLayoutEffect, useRef } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'
import type { AdminPricingZone } from '@rocket-lease/contracts'
import {
  CABA_POLYGON_LAT_LON,
  cellsInPolygon,
  h3ToGeoBoundary,
} from '@/lib/h3'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from '@/lib/maps'
import {
  MULTIPLIER_HEX_COLOR,
  MULTIPLIER_LABEL_KEY,
  MULTIPLIER_LEVELS,
  multiplierLevel,
} from '@/features/admin/lib/multiplier-scale'
import { t } from '@/i18n/es'

interface PricingHexMapProps {
  zones: AdminPricingZone[]
  onHexClick: (zone: AdminPricingZone) => void
  onMapClick: () => void
  selectedH3Cell: string | null
}

function multiplierToColor(multiplier: number): string {
  return MULTIPLIER_HEX_COLOR[multiplierLevel(multiplier)]
}

/**
 * Mapa del admin para visualizar las zonas H3 con su multiplier dinámico.
 * Usa Google Maps via `@vis.gl/react-google-maps` con el mismo `mapId` que
 * `/mapa` para mantener consistencia visual. Renderiza tres capas con
 * `google.maps.Data`:
 *
 * 1. Grilla CABA: todas las celdas H3 de la ciudad como fondo no clickeable.
 * 2. Zonas activas: celdas con oferta/demanda/quotes, coloreadas y clickeables.
 * 3. Outline de selección: borde blanco sobre la celda elegida.
 */
export function PricingHexMap({ zones, onHexClick, onMapClick, selectedH3Cell }: PricingHexMapProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-muted">
        {t('mapa.googleKeyMissing')}
      </div>
    )
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        mapId={GOOGLE_MAPS_MAP_ID}
        defaultCenter={DEFAULT_MAP_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        colorScheme="DARK"
        style={{ width: '100%', height: '100%' }}
        onClick={onMapClick}
      >
        <CabaGridLayer activeCells={new Set(zones.map((z) => z.h3Cell))} />
        <ZonesLayer zones={zones} onHexClick={onHexClick} />
        <SelectedHexLayer cell={selectedH3Cell} />
      </Map>
      <MapLegend />
    </APIProvider>
  )
}

/**
 * Leyenda fija con los cuatro niveles de multiplier y su color, para que el
 * verde/amarillo/naranja/rojo del mapa sea legible sin adivinar.
 */
function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 rounded-xl border border-white/8 bg-surface-1/85 px-3 py-2.5 backdrop-blur">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {t('admin.pricing.legend.title')}
      </p>
      {MULTIPLIER_LEVELS.map((level) => (
        <div key={level} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: MULTIPLIER_HEX_COLOR[level] }}
          />
          <span className="text-xs text-text-secondary">
            {t(MULTIPLIER_LABEL_KEY[level])}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Capa de fondo con todas las celdas H3 de CABA que NO están activas.
 * Render barato porque `google.maps.Data` agrupa todo en un solo overlay.
 */
function CabaGridLayer({ activeCells }: { activeCells: Set<string> }) {
  const map = useMap()
  const dataRef = useRef<google.maps.Data | null>(null)

  useEffect(() => {
    if (!map) return
    const data = new google.maps.Data({ map })
    dataRef.current = data
    data.setStyle({
      fillColor: '#94a3b8',
      fillOpacity: 0.05,
      strokeColor: '#94a3b8',
      strokeOpacity: 0.3,
      strokeWeight: 0.6,
      clickable: false,
    })
    return () => {
      data.setMap(null)
      dataRef.current = null
    }
  }, [map])

  useEffect(() => {
    const data = dataRef.current
    if (!data) return
    data.forEach((feature) => data.remove(feature))
    const cells = cellsInPolygon(CABA_POLYGON_LAT_LON)
    for (const cell of cells) {
      if (activeCells.has(cell)) continue
      data.addGeoJson({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [h3ToGeoBoundary(cell)] },
        properties: { h3Cell: cell },
      })
    }
  }, [activeCells])

  return null
}

/**
 * Capa interactiva de zonas con data. Cada feature pinta según el multiplier
 * y dispara `onHexClick` con la zona correspondiente.
 */
function ZonesLayer({
  zones,
  onHexClick,
}: {
  zones: AdminPricingZone[]
  onHexClick: (zone: AdminPricingZone) => void
}) {
  const map = useMap()
  const dataRef = useRef<google.maps.Data | null>(null)
  const zonesByCellRef = useRef(new globalThis.Map<string, AdminPricingZone>())
  const handlerRef = useRef(onHexClick)
  useLayoutEffect(() => {
    handlerRef.current = onHexClick
  })

  useEffect(() => {
    if (!map) return
    const data = new google.maps.Data({ map })
    dataRef.current = data
    data.setStyle((feature) => {
      const multiplier = (feature.getProperty('avgMultiplier') as number) ?? 1
      return {
        fillColor: multiplierToColor(multiplier),
        fillOpacity: 0.55,
        strokeColor: '#ffffff',
        strokeOpacity: 0.25,
        strokeWeight: 0.8,
        clickable: true,
      }
    })
    const listener = data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      const cell = event.feature.getProperty('h3Cell') as string | undefined
      if (!cell) return
      const zone = zonesByCellRef.current.get(cell)
      if (zone) handlerRef.current(zone)
    })
    return () => {
      google.maps.event.removeListener(listener)
      data.setMap(null)
      dataRef.current = null
    }
  }, [map])

  useEffect(() => {
    const data = dataRef.current
    if (!data) return
    data.forEach((feature) => data.remove(feature))
    zonesByCellRef.current.clear()
    for (const zone of zones) {
      zonesByCellRef.current.set(zone.h3Cell, zone)
      const ring = zone.geometry.coordinates[0]?.length
        ? zone.geometry.coordinates[0]!
        : h3ToGeoBoundary(zone.h3Cell)
      data.addGeoJson({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ring] },
        properties: {
          h3Cell: zone.h3Cell,
          avgMultiplier: zone.avgMultiplier,
        },
      })
    }
  }, [zones])

  return null
}

/**
 * Outline blanco brillante sobre la celda seleccionada para resaltarla por
 * sobre el resto. No es clickeable: el click activo lo maneja `ZonesLayer`.
 */
function SelectedHexLayer({ cell }: { cell: string | null }) {
  const map = useMap()
  const dataRef = useRef<google.maps.Data | null>(null)

  useEffect(() => {
    if (!map) return
    const data = new google.maps.Data({ map })
    dataRef.current = data
    data.setStyle({
      fillOpacity: 0,
      strokeColor: '#ffffff',
      strokeOpacity: 1,
      strokeWeight: 2.5,
      clickable: false,
    })
    return () => {
      data.setMap(null)
      dataRef.current = null
    }
  }, [map])

  useEffect(() => {
    const data = dataRef.current
    if (!data) return
    data.forEach((feature) => data.remove(feature))
    if (!cell) return
    data.addGeoJson({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [h3ToGeoBoundary(cell)] },
      properties: { h3Cell: cell },
    })
  }, [cell])

  return null
}
