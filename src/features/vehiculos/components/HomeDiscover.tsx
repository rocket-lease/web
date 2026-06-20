import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CaretRight, MapPin, NavigationArrow, Sparkle, Clock, Car } from '@phosphor-icons/react'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { VehiculoCard, VehiculoCardSkeleton } from './VehiculoCard'
import { vehiclesApi } from '../api/vehiculos.api'
import { useNearMe } from '@/features/mapa/hooks/useNearMe'

interface HomeDiscoverProps {
  vehicles:    GetVehicleResponse[]
  isLoading:   boolean
  isError:     boolean
  levelDiscountPercentage?: number
  onPickCity:  (city: string) => void
  /** Id del usuario logueado, para mostrar la sección "Mis vehículos". */
  ownerId?:    string
}

/**
 * Vista del home conductor antes de cualquier búsqueda. Mezcla destinos
 * sugeridos arriba con carruseles temáticos de vehículos y una grilla densa
 * abajo. Cada carrusel se arma client-side a partir del mismo dataset
 * filtrado/ordenado por un criterio distinto.
 */
/**
 * Destinos sugeridos en el home. Cada uno arranca una búsqueda en su ciudad.
 *
 * Las fotos usan Lorem Picsum con seed por destino como placeholder estable
 * (siempre cargan, son fotos reales de banco). NO son específicas del lugar
 * — para la versión final hay que swappear cada `photo` por una URL de la
 * ciudad correspondiente (Unsplash, Cloudinary, etc.).
 */
const DESTINATIONS: ReadonlyArray<{ value: string; label: string; hint: string; photo: string }> = [
  { value: 'CABA',                    label: 'Buenos Aires',  hint: 'Ciudad',     photo: 'https://picsum.photos/seed/caba-buenosaires/400/560' },
  { value: 'Bariloche',               label: 'Bariloche',     hint: 'Patagonia',  photo: 'https://picsum.photos/seed/bariloche-lago/400/560' },
  { value: 'Mar del Plata',           label: 'Mar del Plata', hint: 'Costa',      photo: 'https://picsum.photos/seed/mardelplata-playa/400/560' },
  { value: 'Mendoza',                 label: 'Mendoza',       hint: 'Cordillera', photo: 'https://picsum.photos/seed/mendoza-vinedos/400/560' },
  { value: 'Córdoba',                 label: 'Córdoba',       hint: 'Sierras',    photo: 'https://picsum.photos/seed/cordoba-sierras/400/560' },
  { value: 'Salta',                   label: 'Salta',         hint: 'Norte',      photo: 'https://picsum.photos/seed/salta-cerros/400/560' },
  { value: 'Rosario',                 label: 'Rosario',       hint: 'Litoral',    photo: 'https://picsum.photos/seed/rosario-parana/400/560' },
  { value: 'San Martín de los Andes', label: 'San Martín',    hint: 'Patagonia',  photo: 'https://picsum.photos/seed/smandes-andes/400/560' },
]

const CAROUSEL_LIMIT = 8

/** Distancia aproximada en km entre dos coords (haversine simplificado). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const s = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function HomeDiscover({ vehicles, isLoading, isError, levelDiscountPercentage, onPickCity, ownerId }: HomeDiscoverProps) {
  const nearMe = useNearMe()

  const { data: myVehicles } = useQuery({
    queryKey: ['vehicles', 'by-owner', ownerId],
    queryFn: () => vehiclesApi.getByOwnerId(ownerId!),
    enabled: Boolean(ownerId),
  })

  const promoted = useMemo(
    () => vehicles.filter(v => v.isPromoted).slice(0, CAROUSEL_LIMIT),
    [vehicles],
  )

  const nearby = useMemo(() => {
    if (!nearMe.position) return []
    const pos = nearMe.position
    return [...vehicles]
      .filter(v => v.latitude != null && v.longitude != null)
      .map(v => ({ v, d: distanceKm(pos, { lat: v.latitude!, lng: v.longitude! }) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, CAROUSEL_LIMIT)
      .map(x => x.v)
  }, [vehicles, nearMe.position])

  const newest = useMemo(
    () => [...vehicles].sort((a, b) => b.year - a.year).slice(0, CAROUSEL_LIMIT),
    [vehicles],
  )

  if (isError) {
    return (
      <div className="px-5 py-12">
        <p className="text-sm text-danger text-center">No pudimos cargar los autos. Intentá de nuevo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pt-5 pb-8">
      <DestinationsRow onPickCity={onPickCity} />

      {myVehicles && myVehicles.length > 0 && (
        <Carousel
          title="Mis vehículos"
          icon={<Car size={16} weight="fill" className="text-owner" />}
          vehicles={myVehicles}
          isLoading={false}
        />
      )}

      {(promoted.length > 0 || isLoading) && (
        <Carousel
          title="Promocionados"
          icon={<Sparkle size={16} weight="fill" className="text-warning" />}
          vehicles={promoted}
          isLoading={isLoading}
          levelDiscountPercentage={levelDiscountPercentage}
        />
      )}

      {nearMe.status === 'granted' && nearby.length > 0 ? (
        <Carousel
          title="Cerca tuyo"
          icon={<NavigationArrow size={16} weight="fill" className="text-brand-400" />}
          vehicles={nearby}
          isLoading={false}
          levelDiscountPercentage={levelDiscountPercentage}
        />
      ) : (nearMe.status === 'idle' || nearMe.status === 'locating') && (
        <NearbyCTA
          status={nearMe.status}
          onClick={() => nearMe.locate()}
        />
      )}

      <Carousel
        title="Modelos nuevos"
        icon={<Clock size={16} weight="fill" className="text-text-secondary" />}
        vehicles={newest}
        isLoading={isLoading}
        levelDiscountPercentage={levelDiscountPercentage}
      />

      <FullGrid vehicles={vehicles} isLoading={isLoading} levelDiscountPercentage={levelDiscountPercentage} />
    </div>
  )
}

interface FullGridProps {
  vehicles:  GetVehicleResponse[]
  isLoading: boolean
  levelDiscountPercentage?: number
}

/** Fallback al final del home: grilla completa de todo lo disponible. */
function FullGrid({ vehicles, isLoading, levelDiscountPercentage }: FullGridProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="px-5 flex items-center gap-2">
        <Car size={16} weight="fill" className="text-text-secondary" />
        <h2 className="text-base font-bold text-text-primary">Todos los autos</h2>
      </header>

      <div className="px-5">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <VehiculoCardSkeleton key={i} />)
            : vehicles.map(v => <VehiculoCard key={v.id} vehiculo={v} levelDiscountPercentage={levelDiscountPercentage} />)}
        </div>
      </div>
    </section>
  )
}

interface DestinationsRowProps {
  onPickCity: (city: string) => void
}

/**
 * Fila horizontal de destinos populares. Cada card pre-llena la ciudad en
 * la URL de búsqueda, lo que activa el modo mapa+drawer con resultados de
 * esa ciudad.
 */
function DestinationsRow({ onPickCity }: DestinationsRowProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="px-5">
        <h2 className="text-base font-bold text-text-primary">Destinos populares</h2>
        <p className="text-xs text-text-muted mt-0.5">Tocá uno para arrancar tu búsqueda</p>
      </header>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5 pb-1">
          {DESTINATIONS.map((d, i) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onPickCity(d.value)}
              style={{ animationDelay: `${i * 40}ms` }}
              className="relative shrink-0 w-32 h-44 rounded-3xl overflow-hidden bg-surface-2 text-left active:scale-[0.97] transition-transform duration-200 ease-[var(--ease-out)] shadow-[0_4px_20px_rgba(0,0,0,0.55)] opacity-0 translate-y-2 animate-rise-in motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
            >
              <img
                src={d.photo}
                alt={d.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{d.label}</p>
                <p className="text-white/85 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin size={10} weight="fill" />
                  {d.hint}
                </p>
              </div>
            </button>
          ))}
          <div aria-hidden className="shrink-0 w-1" />
        </div>
      </div>
    </section>
  )
}

interface CarouselProps {
  title:     string
  icon:      ReactNode
  vehicles:  GetVehicleResponse[]
  isLoading: boolean
  levelDiscountPercentage?: number
}

/**
 * Carrusel horizontal de cards de vehículos. Cada card tiene ancho fijo
 * (`w-64`) para mantener consistencia visual y permitir snap natural en
 * mobile. El padding lateral coincide con el de la página para que la
 * primera card "asome" desde el borde izquierdo.
 */
function Carousel({ title, icon, vehicles, isLoading, levelDiscountPercentage }: CarouselProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="px-5 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-bold text-text-primary">{title}</h2>
      </header>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-5 pb-1">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 w-64">
                  <VehiculoCardSkeleton />
                </div>
              ))
            : vehicles.map(v => (
                <div key={v.id} className="shrink-0 w-64">
                  <VehiculoCard vehiculo={v} levelDiscountPercentage={levelDiscountPercentage} />
                </div>
              ))}
          <div aria-hidden className="shrink-0 w-1" />
        </div>
      </div>
    </section>
  )
}

interface NearbyCTAProps {
  status:  'idle' | 'locating'
  onClick: () => void
}

/**
 * CTA para pedir geolocalización cuando el carrusel "Cerca tuyo" todavía
 * no puede mostrarse. Se oculta si el usuario ya denegó el permiso o el
 * navegador no soporta la API.
 */
function NearbyCTA({ status, onClick }: NearbyCTAProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="px-5 flex items-center gap-2">
        <NavigationArrow size={16} weight="fill" className="text-brand-400" />
        <h2 className="text-base font-bold text-text-primary">Cerca tuyo</h2>
      </header>

      <div className="px-5">
        <button
          type="button"
          onClick={onClick}
          disabled={status === 'locating'}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface-1 border border-white/8 hover:border-brand-500/40 transition-colors text-left active:scale-[0.99] disabled:opacity-70"
        >
          <div className="shrink-0 h-10 w-10 rounded-full bg-brand-500/15 flex items-center justify-center">
            <NavigationArrow size={18} weight="fill" className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {status === 'locating' ? 'Detectando tu ubicación…' : 'Activar ubicación'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {status === 'locating' ? 'Un segundo' : 'Para ver los autos más cercanos a vos'}
            </p>
          </div>
          <CaretRight size={16} className="text-text-muted shrink-0" />
        </button>
      </div>
    </section>
  )
}
