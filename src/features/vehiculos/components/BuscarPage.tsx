import { MagnifyingGlass, SlidersHorizontal, MapPin, X, Bell } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { VehiculoCard, VehiculoCardSkeleton } from './VehiculoCard'
import { FilterSheet } from './FilterSheet'
import { DateRangePicker } from './DateRangePicker'
import { t } from '@/i18n/es'
import type { SortCriteria, VehiculoFilters } from '../types'
import { vehiclesApi } from '../api/vehiculos.api'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
const FEATURED_CITIES = ['CABA', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Tucumán', 'Salta']

const FILTER_CHIPS = [
  { key: 'transmission', value: 'Automatico', label: t('buscar.filter.transmission.automatic') },
  { key: 'transmission', value: 'Manual',     label: t('buscar.filter.transmission.manual') },
] as const

export function BuscarPage() {
  const [city,       setCity]       = useState<string | undefined>()
  const [cityOpen,   setCityOpen]   = useState(false)
  const [startDate,  setStartDate]  = useState<string | undefined>()
  const [endDate,    setEndDate]    = useState<string | undefined>()
  const [filters,    setFilters]    = useState<VehiculoFilters>({})
  const [sortBy,     setSortBy]     = useState<SortCriteria>('price_asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  const serverCharacteristics = filters.characteristics ?? []
  const { data: vehicles = [], isLoading, isError } = useQuery({
    queryKey: ['vehicles', serverCharacteristics, city ?? null, startDate, endDate],
    queryFn: () => vehiclesApi.getAll({ city, characteristics: serverCharacteristics, from: startDate, to: endDate }),
  })

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return

    const pref = profile.preferences.transmission
    setFilters((current) => ({
      ...current,
      transmission: pref === 'manual' ? 'Manual' : pref === 'automatic' ? 'Automatico' : undefined,
      maxPrice: profile.preferences.maxPriceDaily ?? undefined,
      isAccessible: profile.preferences.accessibility?.length ? true : undefined,
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

  const handleApply = (newFilters: VehiculoFilters, sort: SortCriteria) => {
    setFilters(newFilters)
    setSortBy(sort)
  }

  return (
    <div className="flex flex-col">
      <div
        className="sticky top-0 z-30 bg-surface-0/95 backdrop-blur-xl px-4 pb-3 border-b border-white/5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* Título + notificaciones */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-text-primary">{t('nav.buscar')}</h1>
          <Link
            to="/notificaciones"
            aria-label={t('nav.notificaciones')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors active:scale-95"
          >
            <Bell size={22} />
          </Link>
        </div>

        {/* Fila ciudad + fechas */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setCityOpen(true)}
            className={`flex items-center gap-1.5 rounded-full border px-3 h-10 text-sm font-medium shrink-0 transition-colors ${
              city
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-300'
                : 'bg-surface-1 border-white/8 text-text-muted hover:border-brand-500/40'
            }`}
          >
            <MapPin size={14} weight="fill" className={city ? 'text-brand-400' : 'text-text-muted'} />
            <span className="whitespace-nowrap">{city ?? 'Todas las ciudades'}</span>
            {city && (
              <span
                role="button"
                onClick={e => { e.stopPropagation(); setCity(undefined) }}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={10} />
              </span>
            )}
          </button>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(from, to) => { setStartDate(from); setEndDate(to) }}
          />
        </div>

        {/* Input de búsqueda + filtros */}
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
              enterKeyHint="search"
              autoComplete="off"
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

        {/* Chips de filtro rápido */}
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
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition duration-150 active:scale-95 border ${
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
              <VehiculoCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs text-text-muted">
                <span className="font-semibold text-text-primary">{sorted.length}</span>{' '}
                {t('buscar.results')}
              </p>
              {activeFiltersCount > 0 && (
                <>
                  <span className="text-xs text-text-muted">·</span>
                  <button
                    onClick={() => { setFilters({}); setSortBy('price_asc') }}
                    className="text-xs text-client font-semibold"
                  >
                    {t('buscar.filter.clearAll')}
                  </button>
                </>
              )}
            </div>

            {sorted.length === 0 ? (
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
                {sorted.map(v => (
                  <VehiculoCard key={v.id} vehiculo={v} from={startDate} to={endDate} />
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
            <button
              onClick={() => { setCity(undefined); setCityOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                !city ? 'bg-client/15 text-client font-semibold' : 'text-text-secondary hover:bg-surface-2'
              }`}
            >
              Todas las ciudades
            </button>
            {FEATURED_CITIES.map(c => (
              <button
                key={c}
                onClick={() => { setCity(c); setCityOpen(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                  c === city ? 'bg-client/15 text-client font-semibold' : 'text-text-secondary hover:bg-surface-2'
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
