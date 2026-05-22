import { useCallback, useState } from 'react'

export type GeolocationStatus =
  | 'idle'
  | 'locating'
  | 'granted'
  | 'denied'
  | 'unavailable'

export interface NearMeState {
  status: GeolocationStatus
  position: { lat: number; lng: number } | null
}

/**
 * Geolocalización del navegador para el modo "Cerca de mí". Maneja permiso
 * denegado y navegadores sin soporte con un fallback explícito.
 */
export function useNearMe() {
  const [state, setState] = useState<NearMeState>({
    status: 'idle',
    position: null,
  })

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'unavailable', position: null })
      return
    }
    setState((prev) => ({ ...prev, status: 'locating' }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        })
      },
      (err) => {
        setState({
          status:
            err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          position: null,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle', position: null })
  }, [])

  return { ...state, locate, reset }
}
