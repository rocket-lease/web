import { useCallback, useEffect, useRef, useState } from 'react'
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import { MapPin, MagnifyingGlass, X } from '@phosphor-icons/react'
import { GOOGLE_MAPS_API_KEY, hasGoogleMaps } from '@/lib/maps'
import { t } from '@/i18n/es'
import { Input } from '@/ui/input'
import type { ReservationAddress } from '@rocket-lease/contracts'

const DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 4

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

export interface AddressAutocompleteProps {
  value: ReservationAddress | null
  onChange: (value: ReservationAddress) => void
  onClear: () => void
  placeholder?: string
}

function AddressAutocompleteInner({
  value,
  onChange,
  onClear,
  placeholder,
}: AddressAutocompleteProps) {
  const places = useMapsLibrary('places')
  const [inputValue, setInputValue] = useState(value?.address ?? '')
  const [suggestions, setSuggestions] = useState<SuggestionLike[]>([])
  const [loading, setLoading] = useState(false)
  const sessionTokenRef = useRef<object | null>(null)
  const skipNextSearchRef = useRef(false)

  useEffect(() => {
    setInputValue(value?.address ?? '')
  }, [value?.address])

  useEffect(() => {
    if (places && !sessionTokenRef.current) {
      sessionTokenRef.current = new places.AutocompleteSessionToken()
    }
  }, [places])

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
      const address = place.formattedAddress ?? prediction.text?.text ?? ''
      skipNextSearchRef.current = true
      setInputValue(address)
      setSuggestions([])
      onChange({ address, latitude: loc.lat(), longitude: loc.lng() })
      sessionTokenRef.current = new places.AutocompleteSessionToken()
    },
    [places, onChange],
  )

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    onClear()
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          if (!e.target.value) onClear()
        }}
        placeholder={placeholder ?? t('reservar.homeDelivery.addressPlaceholder')}
        leftIcon={<MagnifyingGlass size={16} />}
        rightIcon={
          inputValue ? (
            <button type="button" onClick={handleClear} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={14} />
            </button>
          ) : undefined
        }
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
                  <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
                  <span>{prediction?.text?.text ?? ''}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function AddressAutocomplete(props: AddressAutocompleteProps) {
  if (!hasGoogleMaps()) {
    return (
      <input
        type="text"
        value={props.value?.address ?? ''}
        onChange={(e) => {
          if (e.target.value) {
            props.onChange({
              address: e.target.value,
              latitude: props.value?.latitude ?? 0,
              longitude: props.value?.longitude ?? 0,
            })
          } else {
            props.onClear()
          }
        }}
        placeholder={props.placeholder ?? t('reservar.homeDelivery.addressPlaceholder')}
        className="w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none"
      />
    )
  }
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
      <AddressAutocompleteInner {...props} />
    </APIProvider>
  )
}
