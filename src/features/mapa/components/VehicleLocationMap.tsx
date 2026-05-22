import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { MapPin } from '@phosphor-icons/react'
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID, hasGoogleMaps } from '@/lib/maps'

interface VehicleLocationMapProps {
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string
  province: string
}

/**
 * Mapa de solo lectura con la ubicación de un vehículo. Se usa en el detalle.
 * Si no hay coordenadas o falta la API key, muestra solo el texto.
 */
export function VehicleLocationMap({
  latitude,
  longitude,
  address,
  city,
  province,
}: VehicleLocationMapProps) {
  const label = address ?? [city, province].filter(Boolean).join(', ')
  const hasCoords = latitude !== null && longitude !== null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-1.5">
        <MapPin
          size={16}
          weight="duotone"
          className="mt-0.5 shrink-0 text-text-muted"
        />
        <span className="text-sm text-text-secondary">{label || '—'}</span>
      </div>

      {hasCoords && hasGoogleMaps() && (
        <div className="h-44 overflow-hidden rounded-xl border border-white/8">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
            <Map
              mapId={GOOGLE_MAPS_MAP_ID}
              defaultCenter={{ lat: latitude, lng: longitude }}
              defaultZoom={15}
              gestureHandling="cooperative"
              disableDefaultUI
            >
              <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
                <MapPin size={32} weight="fill" className="text-brand-500" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        </div>
      )}
    </div>
  )
}
