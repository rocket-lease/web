import { useCallback, useEffect, useRef, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { MapPin, Warning, MagnifyingGlass } from '@phosphor-icons/react'
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  DEFAULT_MAP_CENTER,
  hasGoogleMaps,
} from '@/lib/maps'
import { t } from '@/i18n/es'
import { Input } from '@/ui/input'

export interface LocationValue {
  latitude: number
  longitude: number
  address: string
  /** Provincia derivada de los address components de Google. */
  province: string
  /** Ciudad/localidad derivada de los address components de Google. */
  city: string
}

interface LocationPickerProps {
  value: LocationValue | null
  onChange: (value: LocationValue) => void
  /** Muestra el aviso de "ubicación aproximada" para vehículos migrados. */
  approximate?: boolean
}

/** Espera (ms) tras el último keystroke antes de pedir sugerencias. */
const DEBOUNCE_MS = 450
/** Largo mínimo del texto para disparar una búsqueda. */
const MIN_QUERY_LENGTH = 4

// Tipos estructurales mínimos sobre la API de Google Places. Se usan porque
// el namespace global `google` no está disponible en el tsconfig del proyecto;
// los objetos en runtime cumplen estas formas.
interface AddressComponentLike {
  types: string[]
  longText: string | null
  shortText: string | null
}
interface PlaceLike {
  location?: { lat: () => number; lng: () => number } | null
  formattedAddress?: string | null
  addressComponents?: AddressComponentLike[]
  fetchFields: (req: { fields: string[] }) => Promise<unknown>
}
interface PlacePredictionLike {
  placeId?: string
  text?: { text?: string } | null
  toPlace: () => PlaceLike
}
interface SuggestionLike {
  placePrediction: PlacePredictionLike | null
}

/** Extrae provincia y ciudad de los address components de un Place. */
function extractRegion(components: AddressComponentLike[]): {
  province: string
  city: string
} {
  let province = ''
  let city = ''
  for (const component of components) {
    const types = component.types ?? []
    if (types.includes('administrative_area_level_1')) {
      province = component.longText ?? component.shortText ?? ''
    }
    if (!city && types.includes('locality')) {
      city = component.longText ?? component.shortText ?? ''
    }
    if (!city && types.includes('administrative_area_level_2')) {
      city = component.longText ?? component.shortText ?? ''
    }
  }
  if (!city) city = province
  return { province, city }
}

/** Recentra el mini-mapa cuando cambian las coordenadas seleccionadas. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (map) map.panTo({ lat, lng })
  }, [map, lat, lng])
  return null
}

function LocationPickerInner({
  value,
  onChange,
  approximate,
}: LocationPickerProps) {
  const places = useMapsLibrary('places')
  const [inputValue, setInputValue] = useState(value?.address ?? '')
  const [suggestions, setSuggestions] = useState<SuggestionLike[]>([])
  const [loading, setLoading] = useState(false)
  const sessionTokenRef = useRef<object | null>(null)
  // Evita disparar una búsqueda nueva justo después de elegir una sugerencia.
  const skipNextSearchRef = useRef(false)

  // Un session token agrupa keystrokes + selección como una sola sesión
  // facturable. Se renueva después de cada selección.
  useEffect(() => {
    if (places && !sessionTokenRef.current) {
      sessionTokenRef.current = new places.AutocompleteSessionToken()
    }
  }, [places])

  // Debounce: la request a Google solo se hace cuando el usuario dejó de
  // tipear durante DEBOUNCE_MS — nunca una request por keystroke.
  useEffect(() => {
    if (!places) return
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      return
    }
    const term = inputValue.trim()
    if (term.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      return
    }
    const handle = setTimeout(() => {
      setLoading(true)
      places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: term,
        sessionToken: sessionTokenRef.current ?? undefined,
        // Limita las direcciones a Argentina.
        includedRegionCodes: ['ar'],
        language: 'es-419',
      })
        .then((res: { suggestions: SuggestionLike[] }) => {
          setSuggestions(res.suggestions.filter((s) => s.placePrediction))
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputValue, places])

  const handlePick = useCallback(
    async (suggestion: SuggestionLike) => {
      const prediction = suggestion.placePrediction
      if (!prediction || !places) return
      const place = prediction.toPlace()
      await place.fetchFields({
        fields: ['location', 'formattedAddress', 'addressComponents'],
      })
      const loc = place.location
      if (!loc) return
      const { province, city } = extractRegion(place.addressComponents ?? [])
      const address = place.formattedAddress ?? prediction.text?.text ?? ''

      skipNextSearchRef.current = true
      setInputValue(address)
      setSuggestions([])
      onChange({
        latitude: loc.lat(),
        longitude: loc.lng(),
        address,
        province,
        city,
      })
      // Cierra la sesión: la próxima búsqueda usa un token nuevo.
      sessionTokenRef.current = new places.AutocompleteSessionToken()
    },
    [places, onChange],
  )

  const center = value
    ? { lat: value.latitude, lng: value.longitude }
    : DEFAULT_MAP_CENTER

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">
        {t('location.picker.label')}
      </label>

      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('location.picker.search')}
          leftIcon={<MagnifyingGlass size={16} />}
        />

        {(suggestions.length > 0 || loading) && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-surface-1 py-1 shadow-2xl">
            {loading && suggestions.length === 0 && (
              <li className="px-3 py-2 text-xs text-text-muted">
                {t('location.picker.searching')}
              </li>
            )}
            {suggestions.map((suggestion, idx) => {
              const prediction = suggestion.placePrediction
              return (
                <li key={prediction?.placeId ?? idx}>
                  <button
                    type="button"
                    onClick={() => void handlePick(suggestion)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-2"
                  >
                    <MapPin
                      size={14}
                      className="mt-0.5 shrink-0 text-text-muted"
                    />
                    <span>{prediction?.text?.text ?? ''}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-text-muted">{t('location.picker.hint')}</p>

      {approximate && (
        <p className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-2.5 py-1.5 text-xs text-warning">
          <Warning size={14} weight="duotone" />
          {t('location.picker.approximate')}
        </p>
      )}

      <div className="h-52 overflow-hidden rounded-xl">
        <Map
          mapId={GOOGLE_MAPS_MAP_ID}
          defaultCenter={center}
          defaultZoom={value ? 15 : 11}
          gestureHandling="greedy"
          disableDefaultUI
        >
          {value && (
            <>
              <AdvancedMarker
                position={{ lat: value.latitude, lng: value.longitude }}
                draggable
                onDragEnd={(e) => {
                  const lat = e.latLng?.lat()
                  const lng = e.latLng?.lng()
                  if (lat !== undefined && lng !== undefined) {
                    onChange({ ...value, latitude: lat, longitude: lng })
                  }
                }}
              >
                <MapPin size={32} weight="fill" className="text-brand-500" />
              </AdvancedMarker>
              <Recenter lat={value.latitude} lng={value.longitude} />
            </>
          )}
        </Map>
      </div>

      {value && (
        <p className="text-xs text-text-secondary">
          {t('location.picker.selected')}: {value.address}
        </p>
      )}
    </div>
  )
}

/**
 * Selector de ubicación del vehículo: autocomplete de dirección (Google
 * Places, con session token y debounce, restringido a Argentina) + pin
 * arrastrable para ajuste fino. Provincia y ciudad se derivan del lugar
 * elegido — no se piden por separado.
 */
export function LocationPicker(props: LocationPickerProps) {
  if (!hasGoogleMaps()) {
    return (
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-muted">
        {t('location.picker.noKey')}
      </p>
    )
  }
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
      <LocationPickerInner {...props} />
    </APIProvider>
  )
}
