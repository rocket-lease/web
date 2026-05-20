import { MagnifyingGlass, SlidersHorizontal, MapPin } from '@phosphor-icons/react'
import { useMemo, useState, useEffect, useRef } from 'react'
import { VehiculoCard } from './VehiculoCard'
import { FilterSheet } from './FilterSheet'
import { DateRangePicker } from './DateRangePicker'
import { t } from '@/i18n/es'
import type { Vehiculo, VehiculoFilters, SortCriteria } from '../types'
import { fromApiToVehiculo } from '../utils/map-vehicle'
import { useSearchVehiculos } from '../hooks/useSearchVehiculos'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'

const DEFAULT_CITY = 'Buenos Aires'

const CITIES = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata']

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
    if (filters.isAccessible && !v.isAccessible) return false
    if (filters.minTrunk != null && v.trunkLiters < filters.minTrunk) return false
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
  const [city,       setCity]       = useState(DEFAULT_CITY)
  const [cityOpen,   setCityOpen]   = useState(false)
  const [startDate,  setStartDate]  = useState<string | undefined>()
  const [endDate,    setEndDate]    = useState<string | undefined>()
  const [filters,    setFilters]    = useState<VehiculoFilters>({})
  const [sortBy,     setSortBy]     = useState<SortCriteria>('price_asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return
    const accessibilityPref = profile.preferences.accessibility
    setFilters(f => ({
      ...f,
      transmission: profile.preferences.transmission as VehiculoFilters['transmission'],
      maxPrice:     profile.preferences.maxPriceDaily ?? undefined,
      isAccessible: accessibilityPref && accessibilityPref.length > 0 ? true : undefined,
    }))
    hasAppliedPreferences.current = true
  }, [profile])

  const { data, isLoading } = useSearchVehiculos({ city, startDate, endDate })

  const apiVehiculos = useMemo(
    () => (data ?? []).map(fromApiToVehiculo),
    [data]
  )

  const activeFiltersCount = useMemo(() =>
    [
      filters.transmission,
      filters.minPrice,
      filters.maxPrice,
      filters.minSeats,
      filters.minYear,
      filters.maxYear,
      filters.isAccessible || null,
      filters.minTrunk,
    ].filter(v => v != null).length,
    [filters]
  )

  const displayVehiculos = useMemo(() => {
    const filtered = applyFilters(apiVehiculos, filters)
    return applySort(filtered, sortBy)
  }, [apiVehiculos, filters, sortBy])

  const handleApply = (newFilters: VehiculoFilters, newSort: SortCriteria) => {
    setFilters(newFilters)
    setSortBy(newSort)
  }

  return (

    <div className="flex flex-col">
      {/* Header sticky */}
      <div className="sticky top-14 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5 space-y-3">

        {/* Fila ciudad + fechas */}
        <div className="flex items-center gap-2">
          {/* Botón ciudad */}
          <button
            onClick={() => setCityOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-surface-1 border border-white/8 px-3 h-10 text-sm font-medium text-text-primary shrink-0 hover:border-brand-500/40 transition-colors"
          >
            <MapPin size={14} weight="fill" className="text-client" />
            <span>{city}</span>
          </button>

          {/* Date range picker */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(from, to) => { setStartDate(from); setEndDate(to) }}
          />
        </div>

        {/* Fila búsqueda + filtros */}
        <div className="flex items-center gap-2">
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

          <button
            onClick={() => setFilterOpen(true)}
            className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface-1 border border-white/8 text-text-secondary hover:text-text-primary hover:border-brand-500/40 transition-colors"
            aria-label={t('buscar.filter.title')}
          >
            <SlidersHorizontal size={18} weight={activeFiltersCount > 0 ? 'fill' : 'regular'} className={activeFiltersCount > 0 ? 'text-client' : ''} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-client text-[9px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="px-4 pt-4 pb-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm text-text-muted">{t('buscar.cargando')}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-4">
              <span className="font-semibold text-text-primary">{displayVehiculos.length}</span>{' '}
              {t('buscar.results')}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setFilters({}); setSortBy('price_asc') }}
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
                  <p className="text-xs text-text-muted mt-1">
                    {startDate ?? endDate
                      ? t('buscar.noResultsDatesHint')
                      : t('buscar.noResultsHint')}
                  </p>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setFilters({}); setSortBy('price_asc') }}
                    className="text-xs font-semibold text-text-primary"
                  >
                    {t('buscar.filter.clearAll')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayVehiculos.map(v => (
                  <VehiculoCard key={v.id} vehiculo={v} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sheet selector de ciudad */}
      {cityOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setCityOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-surface-1 border-t border-white/8 p-6 space-y-2"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-text-primary mb-4">{t('buscar.ciudad')}</p>
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => { setCity(c); setCityOpen(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                  c === city
                    ? 'bg-client/15 text-client font-semibold'
                    : 'text-text-secondary hover:bg-surface-2'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

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
