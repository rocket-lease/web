import { SlidersHorizontal } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilterSheet } from './FilterSheet'
import { SearchPill } from './SearchPill'
import { SearchOverlay } from './SearchOverlay'
import { VehicleResultsList } from './VehicleResultsList'
import { t } from '@/i18n/es'
import type { SortCriteria, VehiculoFilters } from '../types'
import { vehiclesApi } from '../api/vehiculos.api'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import type { Characteristic, GetVehicleResponse } from '@rocket-lease/contracts'
import { Route, type BuscarSearch } from '@/routes/_app/buscar'

/**
 * Mapea los search params planos de la URL al shape `VehiculoFilters` que
 * espera `FilterSheet` y la lógica de filtrado client-side.
 */
function searchToFilters(s: BuscarSearch): VehiculoFilters {
  return {
    query:           s.query,
    transmission:    s.transmission,
    minPrice:        s.minPrice,
    maxPrice:        s.maxPrice,
    minSeats:        s.minSeats,
    minYear:         s.minYear,
    maxYear:         s.maxYear,
    isAccessible:    s.accessible,
    minTrunk:        s.minTrunk,
    characteristics: s.characteristics as Characteristic[] | undefined,
  }
}

/**
 * Inversa de `searchToFilters`: traduce el objeto que devuelve `FilterSheet`
 * al subset de search params para `navigate({ search })`.
 */
function filtersToSearchPatch(f: VehiculoFilters): Partial<BuscarSearch> {
  return {
    transmission:    f.transmission ?? undefined,
    minPrice:        f.minPrice ?? undefined,
    maxPrice:        f.maxPrice ?? undefined,
    minSeats:        f.minSeats ?? undefined,
    minYear:         f.minYear ?? undefined,
    maxYear:         f.maxYear ?? undefined,
    accessible:      f.isAccessible ? true : undefined,
    minTrunk:        f.minTrunk ?? undefined,
    characteristics: f.characteristics?.length ? f.characteristics : undefined,
  }
}

export function BuscarPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  /**
   * Reemplaza un subset de search params manteniendo el resto. Pasar
   * `undefined` para borrar un campo (TanStack Router lo omite de la URL).
   */
  const updateSearch = (patch: Partial<BuscarSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  const filters = searchToFilters(search)
  const sortBy: SortCriteria = search.sort ?? 'price_asc'

  const serverCharacteristics = filters.characteristics ?? []
  const { data: vehicles = [], isLoading, isError } = useQuery({
    queryKey: ['vehicles', serverCharacteristics, search.city ?? null, search.start, search.end],
    queryFn: () => vehiclesApi.getAll({
      city:            search.city,
      characteristics: serverCharacteristics,
      from:            search.start,
      to:              search.end,
    }),
  })

  /**
   * Aplica las preferencias del perfil solo si el usuario llegó a `/buscar`
   * sin ningún parámetro en la URL (es decir, no vino de un deep-link ni
   * había una búsqueda previa). Esto preserva el comportamiento previo de
   * "pre-llenar filtros con mis preferencias" sin pisar URLs explícitas.
   */
  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return
    hasAppliedPreferences.current = true

    if (Object.keys(search).length > 0) return

    const pref = profile.preferences.transmission
    updateSearch({
      transmission: pref === 'manual' ? 'Manual' : pref === 'automatic' ? 'Automatico' : undefined,
      maxPrice:     profile.preferences.maxPriceDaily ?? undefined,
      accessible:   profile.preferences.accessibility?.length ? true : undefined,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (filters.isAccessible && !v.isAccessible) return false
    if (filters.minTrunk != null && v.trunkLiters < filters.minTrunk) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPromoted && !b.isPromoted) return -1
    if (!a.isPromoted && b.isPromoted) return 1
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
    filters.isAccessible || null,
    filters.minTrunk,
    filters.characteristics?.length ? filters.characteristics : null,
  ].filter(v => v != null).length

  const handleApplyFilters = (newFilters: VehiculoFilters, sort: SortCriteria) => {
    updateSearch({
      ...filtersToSearchPatch(newFilters),
      sort: sort === 'price_asc' ? undefined : sort,
    })
  }

  const clearAllFilters = () => {
    updateSearch({
      transmission:    undefined,
      minPrice:        undefined,
      maxPrice:        undefined,
      minSeats:        undefined,
      minYear:         undefined,
      maxYear:         undefined,
      accessible:      undefined,
      minTrunk:        undefined,
      characteristics: undefined,
      sort:            undefined,
    })
  }

  return (
    <div className="flex flex-col">
      <div
        className="sticky top-0 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pb-3 border-b border-white/5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        {/* Search pill + filtros */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchPill
              city={search.city}
              start={search.start}
              end={search.end}
              onClick={() => setSearchOpen(true)}
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="relative shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-surface-1 border border-white/8 text-text-secondary hover:text-text-primary hover:border-brand-500/40 transition-colors"
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

      <VehicleResultsList
        vehicles={sorted}
        isLoading={isLoading}
        isError={isError}
        from={search.start}
        to={search.end}
        hasDateFilter={!!(search.start ?? search.end)}
        hasActiveFilter={activeFiltersCount > 0}
        onClearFilters={clearAllFilters}
      />

      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initial={{ city: search.city, start: search.start, end: search.end }}
        onSearch={({ city, start, end }) => updateSearch({ city, start, end })}
      />

      <FilterSheet
        open={filterOpen}
        filters={filters}
        sortBy={sortBy}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
