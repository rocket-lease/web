import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin } from 'lucide-react'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
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

export function BuscarPage() {
  const [filters, setFilters] = useState<VehiculoFilters>({})
  const [showFilters, setShowFilters] = useState(false)

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
      {/* Search header */}
      <div className="sticky top-0 z-10 bg-surface-0/95 backdrop-blur-xl border-b border-white/6 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-brand-400 font-bold text-lg tracking-tight">Rocket Lease</div>
          <div className="ml-auto flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-xs text-text-muted">Buenos Aires</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder={t('buscar.placeholder')}
            value={filters.query ?? ''}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
            className="flex-1"
          />
          <Button
            variant={showFilters ? 'default' : 'secondary'}
            size="icon"
            onClick={() => setShowFilters(s => !s)}
            aria-label={t('buscar.filters')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick filters */}
        {showFilters && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['automatic', 'manual'] as const).map(tr => (
              <button
                key={tr}
                onClick={() =>
                  setFilters(f => ({
                    ...f,
                    transmission: f.transmission === tr ? null : tr,
                  }))
                }
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filters.transmission === tr
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-2 text-text-secondary'
                  }`}
              >
                {tr === 'automatic' ? t('buscar.filter.transmission.automatic') : t('buscar.filter.transmission.manual')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text-primary">{filtered.length}</span> {t('buscar.results')}
          </p>
          {filters.transmission && (
            <Badge variant="default" className="text-xs">
              {filters.transmission === 'automatic' ? 'Automático' : 'Manual'}
            </Badge>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-secondary">{t('buscar.noResults')}</p>
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
