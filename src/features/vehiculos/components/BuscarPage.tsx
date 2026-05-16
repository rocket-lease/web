import { MagnifyingGlass, SlidersHorizontal, MapPin } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VehiculoCard } from './VehiculoCard'
import { FilterSheet } from './FilterSheet'
import { t } from '@/i18n/es'
import type { SortCriteria, VehiculoFilters } from '../types'
import { vehiclesApi } from '../api/vehiculos.api'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import type { GetVehicleResponse } from '@rocket-lease/contracts'

const FILTER_CHIPS = [
  { key: 'transmission', value: 'Automatico', label: t('buscar.filter.transmission.automatic') },
  { key: 'transmission', value: 'Manual',     label: t('buscar.filter.transmission.manual') },
] as const

export function BuscarPage() {
  const [filters,    setFilters]    = useState<VehiculoFilters>({})
  const [sortBy,     setSortBy]     = useState<SortCriteria>('price_asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  const serverCharacteristics = filters.characteristics ?? []
  const { data: vehicles = [], isLoading, isError } = useQuery({
    queryKey: ['vehicles', serverCharacteristics],
    queryFn: () => vehiclesApi.getAll(serverCharacteristics),
  })

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return

    const pref = profile.preferences.transmission
    setFilters((current) => ({
      ...current,
      transmission: pref === 'manual' ? 'Manual' : pref === 'automatic' ? 'Automatico' : undefined,
      maxPriceDaily: profile.preferences.maxPriceDaily,
      accessibility: profile.preferences.accessibility,
    }))
    hasAppliedPreferences.current = true
  }, [profile])

  const filtered = (vehicles as GetVehicleResponse[]).filter(v => {
    if (filters.query) {
      const q = filters.query.toLowerCase()
      if (!(`${v.brand} ${v.model} ${v.city}`.toLowerCase().includes(q))) return false
    }
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.minPrice != null && v.basePriceCents / 100 < filters.minPrice) return false
    if (filters.maxPrice != null && v.basePriceCents / 100 > filters.maxPrice) return false
    if (filters.minSeats != null && v.passengers < filters.minSeats) return false
    if (filters.minYear  != null && v.year < filters.minYear) return false
    if (filters.maxYear  != null && v.year > filters.maxYear) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc')  return a.basePriceCents - b.basePriceCents
    if (sortBy === 'price_desc') return b.basePriceCents - a.basePriceCents
    return 0
  })

  const activeFiltersCount = [
    filters.transmission,
    filters.minPrice,
    filters.maxPrice,
    filters.minSeats,
    filters.minYear,
    filters.maxYear,
    filters.characteristics?.length ? filters.characteristics : null,
  ].filter(v => v != null).length

  const handleApply = (newFilters: VehiculoFilters, sort: SortCriteria) => {
    setFilters(newFilters)
    setSortBy(sort)
  }

  return (
    <div className="flex flex-col">
      {/* Barra de búsqueda — sticky bajo la top bar global (incluye safe-area-inset-top) */}
      <div
        className="sticky z-30 bg-surface-0/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}
      >

        {/* Fila de ubicación */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} weight="fill" className="text-client" />
          <span className="text-xs font-medium text-text-secondary">{t('buscar.location.city')}</span>
        </div>

        {/* Input de búsqueda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <MagnifyingGlass size={16} weight="regular" />
            </div>
            <input
              type="search"
              placeholder={t('buscar.placeholder')}
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

        {/* Chips de filtro */}
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
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 border ${
                  active
                    ? 'bg-gradient-to-br from-client to-brand-500 text-white border-transparent'
                    : 'bg-surface-1 text-text-secondary border-white/10'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resultados */}
      <div className="px-4 pt-4 pb-2">
        {isError && (
          <p className="text-sm text-danger text-center py-8">{t('buscar.error')}</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-surface-1 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-4">
              <span className="font-semibold text-text-primary">{sorted.length}</span> {t('buscar.results')}
            </p>

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <MagnifyingGlass size={48} weight="thin" className="text-text-muted" />
                <div>
                  <p className="text-text-secondary font-medium">{t('buscar.noResults')}</p>
                  <p className="text-xs text-text-muted mt-1">{t('buscar.noResultsHint')}</p>
                </div>
                {Object.values(filters).some(Boolean) && (
                  <button
                    onClick={() => setFilters({})}
                    className="text-xs font-semibold text-text-primary"
                  >
                    {t('buscar.filter.clear')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sorted.map(v => (
                  <VehiculoCard key={v.id} vehiculo={v} />
                ))}
              </div>
            )}
          </>
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
