import { useMemo } from 'react'
import { Map, Source, Layer, type MapLayerMouseEvent } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { h3ToGeoBoundary } from '@/lib/h3'
import type { AdminPricingZone } from '@rocket-lease/contracts'

interface PricingHexMapProps {
  zones: AdminPricingZone[]
  onHexClick: (zone: AdminPricingZone) => void
  selectedH3Cell: string | null
}

interface HexFeatureProperties {
  h3Cell: string
  avgMultiplier: number
}

interface HexFeature {
  type: 'Feature'
  geometry: { type: 'Polygon'; coordinates: Array<Array<[number, number]>> }
  properties: HexFeatureProperties
}

const HEX_FILL_LAYER_ID = 'pricing-hex-fill'
const HEX_OUTLINE_LAYER_ID = 'pricing-hex-outline'
const HEX_SELECTED_LAYER_ID = 'pricing-hex-selected'

const INITIAL_VIEW = {
  longitude: -58.42,
  latitude: -34.6,
  zoom: 11,
}

const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json'

/**
 * Convierte la lista de zonas de pricing en una FeatureCollection GeoJSON
 * apta para que MapLibre la pinte como capa de polígonos.
 */
function zonesToFeatureCollection(zones: AdminPricingZone[]): {
  type: 'FeatureCollection'
  features: HexFeature[]
} {
  const features = zones.map<HexFeature>((zone) => {
    const ring = zone.geometry.coordinates[0]?.length
      ? zone.geometry.coordinates[0]!
      : h3ToGeoBoundary(zone.h3Cell)
    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [ring] },
      properties: {
        h3Cell: zone.h3Cell,
        avgMultiplier: zone.avgMultiplier,
      },
    }
  })
  return { type: 'FeatureCollection', features }
}

export function PricingHexMap({ zones, onHexClick, selectedH3Cell }: PricingHexMapProps) {
  const geojson = useMemo(() => zonesToFeatureCollection(zones), [zones])
  const selectedGeojson = useMemo(() => {
    if (!selectedH3Cell) return { type: 'FeatureCollection' as const, features: [] as HexFeature[] }
    const found = geojson.features.find((f) => f.properties.h3Cell === selectedH3Cell)
    return { type: 'FeatureCollection' as const, features: found ? [found] : [] }
  }, [geojson, selectedH3Cell])

  const zonesByCell = useMemo(() => {
    const lookup = new globalThis.Map<string, AdminPricingZone>()
    for (const zone of zones) lookup.set(zone.h3Cell, zone)
    return lookup
  }, [zones])

  const handleClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) return
    const h3Cell = (feature.properties as HexFeatureProperties | undefined)?.h3Cell
    if (!h3Cell) return
    const zone = zonesByCell.get(h3Cell)
    if (zone) onHexClick(zone)
  }

  return (
    <Map
      mapLib={maplibregl}
      mapStyle={MAP_STYLE_URL}
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={[HEX_FILL_LAYER_ID]}
      onClick={handleClick}
    >
      <Source id="pricing-hex" type="geojson" data={geojson}>
        <Layer
          id={HEX_FILL_LAYER_ID}
          type="fill"
          paint={{
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'avgMultiplier'],
              0.7, '#22c55e',
              1.0, '#facc15',
              1.5, '#f97316',
              2.0, '#dc2626',
            ],
            'fill-opacity': 0.55,
          }}
        />
        <Layer
          id={HEX_OUTLINE_LAYER_ID}
          type="line"
          paint={{
            'line-color': 'rgba(0, 0, 0, 0.35)',
            'line-width': 0.8,
          }}
        />
      </Source>
      <Source id="pricing-hex-selected" type="geojson" data={selectedGeojson}>
        <Layer
          id={HEX_SELECTED_LAYER_ID}
          type="line"
          paint={{
            'line-color': '#ffffff',
            'line-width': 2.5,
          }}
        />
      </Source>
    </Map>
  )
}
