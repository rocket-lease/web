import { useState } from 'react'
import { MagnifyingGlass, SlidersHorizontal, MapPin } from '@phosphor-icons/react'
import { VehiculoCard } from './VehiculoCard'
import { t } from '@/i18n/es'
import type { Vehiculo, VehiculoFilters } from '../types'

const MOCK_VEHICULOS: Vehiculo[] = [
  {
    id: '1',
    rentadorId: 'r1',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2022,
    patente: 'AB123CD',
    transmission: 'automatic',
    asientos: 5,
    combustible: 'nafta',
    descripcion: 'Automóvil en perfecto estado, aire acondicionado, bluetooth.',
    tags: ['Aire A/C', 'Bluetooth', 'GPS'],
    tarifa: { daily: 850000, weekly: 5500000, monthly: 19000000 },
    fotos: [{ id: 'f1', url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', order: 0 }],
    disponible: true,
    rating: 4.8,
    reviewCount: 47,
    ubicacion: { direccion: 'Palermo, CABA', lat: -34.5824, lng: -58.4359, ciudad: 'Buenos Aires' },
    rentador: { id: 'r1', nombre: 'Lucas M.', rating: 4.9, reviewCount: 120, level: 'gold' },
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    rentadorId: 'r2',
    marca: 'Volkswagen',
    modelo: 'Polo',
    anio: 2021,
    patente: 'EF456GH',
    transmission: 'manual',
    asientos: 5,
    combustible: 'nafta',
    descripcion: 'Económico y fácil de maniobrar, ideal para la ciudad.',
    tags: ['Económico', 'Fácil estacionar'],
    tarifa: { daily: 620000, weekly: 3900000 },
    fotos: [{ id: 'f2', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600', order: 0 }],
    disponible: true,
    rating: 4.5,
    reviewCount: 23,
    ubicacion: { direccion: 'Belgrano, CABA', lat: -34.562, lng: -58.458, ciudad: 'Buenos Aires' },
    rentador: { id: 'r2', nombre: 'Carmen V.', rating: 4.7, reviewCount: 85, level: 'silver' },
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    rentadorId: 'r3',
    marca: 'Ford',
    modelo: 'EcoSport',
    anio: 2023,
    patente: 'IJ789KL',
    transmission: 'automatic',
    asientos: 5,
    combustible: 'nafta',
    descripcion: 'SUV compacta, ideal para viajes y aventuras.',
    tags: ['SUV', 'Tracción 4x4', 'Espacioso'],
    tarifa: { daily: 1100000, weekly: 6800000, monthly: 25000000 },
    fotos: [{ id: 'f3', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600', order: 0 }],
    disponible: false,
    rating: 4.9,
    reviewCount: 61,
    ubicacion: { direccion: 'San Isidro, GBA', lat: -34.472, lng: -58.527, ciudad: 'Gran Buenos Aires' },
    rentador: { id: 'r3', nombre: 'Sofía R.', rating: 5.0, reviewCount: 30, level: 'platinum' },
    createdAt: '2024-03-01',
  },
]

const FILTER_CHIPS = [
  { key: 'transmission', value: 'automatic', label: t('buscar.filter.transmission.automatic') },
  { key: 'transmission', value: 'manual',    label: t('buscar.filter.transmission.manual') },
] as const

export function BuscarPage() {
  const [filters, setFilters] = useState<VehiculoFilters>({})

  const filtered = MOCK_VEHICULOS.filter(v => {
    if (filters.query) {
      const q = filters.query.toLowerCase()
      if (!(`${v.marca} ${v.modelo} ${v.ubicacion.ciudad}`.toLowerCase().includes(q))) return false
    }
    if (filters.transmission && v.transmission !== filters.transmission) return false
    return true
  })

  return (
    <div className="flex flex-col">
      {/* Search bar — sticky below global top bar (top-14 = 56px) */}
      <div className="sticky top-14 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5">

        {/* Location row */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} weight="fill" color="#06B6D4" />
          <span className="text-xs font-medium text-text-secondary">Buenos Aires</span>
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <MagnifyingGlass size={16} weight="regular" />
          </div>
          <input
            type="search"
            placeholder={t('buscar.placeholder')}
            value={filters.query ?? ''}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
            className="w-full h-12 rounded-full bg-surface-1 border border-white/8 pl-10 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 transition-colors"
          />
          <button
            onClick={() => setFilters(f => ({ ...f, transmission: undefined }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={t('buscar.filters')}
          >
            <SlidersHorizontal size={14} weight="regular" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CHIPS.map(chip => {
            const active = filters[chip.key as keyof VehiculoFilters] === chip.value
            return (
              <button
                key={chip.value}
                onClick={() => setFilters(f => ({
                  ...f,
                  [chip.key]: f[chip.key as keyof VehiculoFilters] === chip.value ? undefined : chip.value,
                }))}
                className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95"
                style={active
                  ? { background: 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', color: '#A0A0B8', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted mb-4">
          <span className="font-semibold text-text-primary">{filtered.length}</span> {t('buscar.results')}
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <MagnifyingGlass size={48} weight="thin" color="#5A5A78" />
            <div>
              <p className="text-text-secondary font-medium">{t('buscar.noResults')}</p>
              <p className="text-xs text-text-muted mt-1">Probá con otra búsqueda o cambiá los filtros</p>
            </div>
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={() => setFilters({})}
                className="text-xs font-semibold"
                style={{ color: '#06B6D4' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map(v => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
