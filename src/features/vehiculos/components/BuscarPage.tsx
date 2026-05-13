import { MagnifyingGlass, SlidersHorizontal, MapPin } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { VehiculoCard } from './VehiculoCard'
import { FilterSheet } from './FilterSheet'
import { SortBar } from './SortBar'
import { t } from '@/i18n/es'
import type { Vehiculo, VehiculoFilters, SortCriteria } from '../types'
import { MOCK_VEHICULOS } from '../data/mock-vehiculos'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useEffect, useRef } from 'react'

function applyFilters(vehicles: Vehiculo[], filters: VehiculoFilters): Vehiculo[] {
  return vehicles.filter(v => {
    if (filters.query) {
      const q = filters.query.toLowerCase()
      if (!(`${v.marca} ${v.modelo} ${v.ubicacion.ciudad}`).toLowerCase().includes(q)) return false
    }
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.minPrice != null && v.tarifa.daily < filters.minPrice)   return false
    if (filters.maxPrice != null && v.tarifa.daily > filters.maxPrice)   return false
    if (filters.minSeats != null && v.asientos < filters.minSeats)       return false
    if (filters.minYear  != null && v.anio < filters.minYear)            return false
    if (filters.maxYear  != null && v.anio > filters.maxYear)            return false
    if (filters.model    && !v.modelo.toLowerCase().includes(filters.model.toLowerCase())) return false
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

export function BuscarPage() {
  const [filters,    setFilters]    = useState<VehiculoFilters>({})
  const [sortBy,     setSortBy]     = useState<SortCriteria>('price_asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return
    setFilters(f => ({
      ...f,
      transmission:  profile.preferences.transmission as VehiculoFilters['transmission'],
      maxPrice:      profile.preferences.maxPriceDaily,
    }))
    hasAppliedPreferences.current = true
  }, [profile])

  const activeFiltersCount = useMemo(() =>
    Object.values(filters).filter(v => v != null && v !== '').length,
    [filters]
  )

  const displayVehiculos = useMemo(() => {
    const filtered = applyFilters(MOCK_VEHICULOS, filters)
    return applySort(filtered, sortBy)
  }, [filters, sortBy])

  return (
    <div className="flex flex-col">
      {/* Search bar — sticky */}
      <div className="sticky top-14 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5">

        {/* Location row */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} weight="fill" className="text-client" />
          <span className="text-xs font-medium text-text-secondary">{t('buscar.location.city')}</span>
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
            onClick={() => setFilterOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={t('buscar.filter.title')}
          >
            <SlidersHorizontal
              size={14}
              weight={activeFiltersCount > 0 ? 'fill' : 'regular'}
              className={activeFiltersCount > 0 ? 'text-client' : ''}
            />
          </button>
        </div>

        {/* Sort chips */}
        <div className="mt-3">
          <SortBar value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted mb-4">
          <span className="font-semibold text-text-primary">{displayVehiculos.length}</span>{' '}
          {t('buscar.results')}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => setFilters({})}
              className="ml-2 text-client font-semibold"
            >
              · {t('buscar.filter.clearAll')}
            </button>
          )}
        </p>

        {displayVehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <MagnifyingGlass size={48} weight="thin" className="text-text-muted" />
            <div>
              <p className="text-text-secondary font-medium">{t('buscar.noResults')}</p>
              <p className="text-xs text-text-muted mt-1">{t('buscar.noResultsHint')}</p>
            </div>
            <button onClick={() => setFilters({})} className="text-xs font-semibold text-text-primary">
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
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </div>
  )
}
