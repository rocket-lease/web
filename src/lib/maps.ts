/**
 * Configuración de Google Maps. La API key es una "browser key" restringida
 * por HTTP referrer + API en GCP Console; queda expuesta en el bundle, eso es
 * esperado. Si falta, las vistas de mapa muestran un fallback degradado.
 */
export const GOOGLE_MAPS_API_KEY = import.meta.env
  .VITE_GOOGLE_MAPS_API_KEY as string | undefined

/** Map ID para Advanced Markers. `DEMO_MAP_ID` sirve para desarrollo. */
export const GOOGLE_MAPS_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ??
  'DEMO_MAP_ID'

export const hasGoogleMaps = (): boolean =>
  typeof GOOGLE_MAPS_API_KEY === 'string' && GOOGLE_MAPS_API_KEY.length > 0

/** Centro por defecto: CABA. */
export const DEFAULT_MAP_CENTER = { lat: -34.6037, lng: -58.3816 }
export const DEFAULT_MAP_ZOOM = 11

/** Opciones de radio para "Cerca de mí" (km). */
export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const
