import { MagnifyingGlass, SlidersHorizontal, MapPin } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { VehiculoCard } from './VehiculoCard'
import { t } from '@/i18n/es'
import type { VehiculoFilters } from '../types'
import { MOCK_VEHICULOS } from '../data/mock-vehiculos'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'

const FILTER_CHIPS = [
  { key: 'transmission', value: 'automatic', label: t('buscar.filter.transmission.automatic') },
  { key: 'transmission', value: 'manual',    label: t('buscar.filter.transmission.manual') },
] as const

export function BuscarPage() {
  const [filters, setFilters] = useState<VehiculoFilters>({})
  const { data: profile } = useMyProfile()
  const hasAppliedPreferences = useRef(false)

  useEffect(() => {
    if (!profile || hasAppliedPreferences.current) return

    setFilters((current) => ({
      ...current,
      transmission: profile.preferences.transmission,
      maxPriceDaily: profile.preferences.maxPriceDaily,
      accessibility: profile.preferences.accessibility,
    }))
    hasAppliedPreferences.current = true
  }, [profile])

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
            onClick={() => setFilters(f => ({ ...f, transmission: undefined }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={t('buscar.filter.transmission.clear')}
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

      {/* Results */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted mb-4">
          <span className="font-semibold text-text-primary">{filtered.length}</span> {t('buscar.results')}
        </p>

        {filtered.length === 0 ? (
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
            {filtered.map(v => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
