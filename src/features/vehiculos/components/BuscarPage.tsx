import { MagnifyingGlass, SlidersHorizontal } from '@phosphor-icons/react'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VehiculoCard } from './VehiculoCard'
import { FilterSheet } from './FilterSheet'
import { t } from '@/i18n/es'
import type { Vehiculo, VehiculoFilters, SortCriteria } from '../types'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { vehiclesApi } from '../api/vehiculos.api'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { getCharacteristicLabel } from '../utils/characteristics'

function applyFilters(vehicles: Vehiculo[], filters: VehiculoFilters): Vehiculo[] {
  return vehicles.filter(v => {
    if (filters.query) {
      const q = filters.query.toLowerCase()
      if (!(`${v.marca} ${v.modelo}`).toLowerCase().includes(q)) return false
    }
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.minPrice != null && v.tarifa.daily < filters.minPrice)   return false
    if (filters.maxPrice != null && v.tarifa.daily > filters.maxPrice)   return false
    if (filters.minSeats != null && v.asientos < filters.minSeats) return false
    if (filters.minYear  != null && v.anio < filters.minYear)     return false
    if (filters.maxYear  != null && v.anio > filters.maxYear)     return false
    if (filters.characteristics?.length) {
      const hasAll = filters.characteristics.every((item) => v.characteristics.includes(item))
      if (!hasAll) return false
    }
    return true
  })
}

function applySort(vehicles: Vehiculo[], sort: SortCriteria): Vehiculo[] {
  const arr = [...vehicles]
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => a.tarifa.daily - b.tarifa.daily)
    case 'price_desc': return arr.sort((a, b) => b.tarifa.daily - a.tarifa.daily)
    case 'rating':     return arr.sort((a, b) => b.rating - a.rating)
    default:           return arr
  }
}

const transmissionToUi = (value: string): 'automatic' | 'manual' =>
  value === 'Manual' ? 'manual' : 'automatic'

const toVehiculo = (vehicle: GetVehicleResponse): Vehiculo => {
  const characteristics = Array.isArray(vehicle.characteristics)
    ? vehicle.characteristics
    : []
  const tags = characteristics.map(getCharacteristicLabel)
  const photos = Array.isArray(vehicle.photos) ? vehicle.photos : []

  return {
    id: vehicle.id,
    rentadorId: vehicle.ownerId,
    marca: vehicle.brand,
    modelo: vehicle.model,
    anio: vehicle.year,
    patente: vehicle.plate,
    transmission: transmissionToUi(vehicle.transmission),
    asientos: vehicle.passengers,
    combustible: 'nafta',
    descripcion: vehicle.description ?? '',
    tags,
    characteristics,
    tarifa: { daily: vehicle.basePrice },
    fotos: photos.map((url, index) => ({
      id: `${vehicle.id}-${index}`,
      url,
      order: index,
    })),
    disponible: vehicle.enabled,
    rating: 4.7,
    reviewCount: 0,
    ubicacion: {
      direccion: `${vehicle.city}, ${vehicle.province}`,
      lat: 0,
      lng: 0,
      ciudad: vehicle.city,
    },
    rentador: {
      id: vehicle.ownerId,
      nombre: 'Rentador',
      rating: 4.7,
      reviewCount: 0,
      level: 'bronze',
    },
    createdAt: new Date().toISOString(),
  }
}

export function BuscarPage() {
  const [filters,    setFilters]    = useState<VehiculoFilters>({})
  const [sortBy,     setSortBy]     = useState<SortCriteria>('price_asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  const serverCharacteristics = filters.characteristics ?? []
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'list', serverCharacteristics],
    queryFn: () => vehiclesApi.getAll(serverCharacteristics),
  })

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return
    setFilters(f => ({
      ...f,
      transmission: profile.preferences.transmission as VehiculoFilters['transmission'],
      maxPrice:     profile.preferences.maxPriceDaily,
    }))
    hasAppliedPreferences.current = true
  }, [profile])

  const activeFiltersCount = useMemo(() =>
    Object.entries(filters)
      .filter(([k, v]) => k !== 'query' && v != null && v !== '')
      .length,
    [filters]
  )

  const displayVehiculos = useMemo(() => {
    const base = (vehiclesQuery.data ?? []).map(toVehiculo)
    const filtered = applyFilters(base, filters)
    return applySort(filtered, sortBy)
  }, [filters, sortBy, vehiclesQuery.data])

  const handleApply = (newFilters: VehiculoFilters, sort: SortCriteria) => {
    setFilters(newFilters)
    setSortBy(sort)
  }

  return (
    <div className="flex flex-col">
      {/* Search bar - sticky */}
      <div className="sticky top-14 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <MagnifyingGlass size={16} weight="regular" />
            </div>
            <input
              type="search"
              placeholder={t('buscar.placeholder.search')}
              value={filters.query ?? ''}
              onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              className="w-full h-12 rounded-full bg-surface-1 border border-white/8 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 transition-colors"
            />
          </div>

          {/* Filter button — al costado del input */}
          <button
            onClick={() => setFilterOpen(true)}
            className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface-1 border border-white/8 text-text-secondary hover:text-text-primary hover:border-brand-500/40 transition-colors"
            aria-label={t('buscar.filter.title')}
          >
            <SlidersHorizontal
              size={18}
              weight={activeFiltersCount > 0 ? 'fill' : 'regular'}
              className={activeFiltersCount > 0 ? 'text-client' : ''}
            />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-client text-[9px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted mb-4">
          <span className="font-semibold text-text-primary">{displayVehiculos.length}</span>{' '}
          {t('buscar.results')}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilters({}); setSortBy('price_asc') }}
              className="ml-2 text-client font-semibold"
            >
              - {t('buscar.filter.clearAll')}
            </button>
          )}
        </p>

        {vehiclesQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
            <p className="text-text-secondary">{t('buscar.loading')}</p>
          </div>
        ) : displayVehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <MagnifyingGlass size={48} weight="thin" className="text-text-muted" />
            <div>
              <p className="text-text-secondary font-medium">{t('buscar.noResults')}</p>
              <p className="text-xs text-text-muted mt-1">{t('buscar.noResultsHint')}</p>
            </div>
            <button
              onClick={() => { setFilters({}); setSortBy('price_asc') }}
              className="text-xs font-semibold text-text-primary"
            >
              {t('buscar.filter.clearAll')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {displayVehiculos.map(v => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        filters={filters}
        sortBy={sortBy}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </div>
  )
}
