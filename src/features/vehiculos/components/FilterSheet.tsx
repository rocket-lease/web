import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import { SortBar } from './SortBar'
import type { VehiculoFilters, SortCriteria } from '../types'

interface FilterSheetProps {
  open:    boolean
  filters: VehiculoFilters
  sortBy:  SortCriteria
  onClose: () => void
  onApply: (filters: VehiculoFilters, sort: SortCriteria) => void
}

const SEAT_OPTIONS = [2, 4, 5, 7]
const TRANSMISSION_OPTIONS = [
  { value: 'Automatico' as const, label: t('buscar.filter.transmission.automatic') },
  { value: 'Manual'     as const, label: t('buscar.filter.transmission.manual') },
]
const CURRENT_YEAR = new Date().getFullYear()

export function FilterSheet({ open, filters, sortBy, onClose, onApply }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<VehiculoFilters>(filters)
  const [localSort,    setLocalSort]    = useState<SortCriteria>(sortBy)

  const set = <K extends keyof VehiculoFilters>(key: K, value: VehiculoFilters[K]) =>
    setLocalFilters(f => ({ ...f, [key]: value }))

  const handleApply = () => {
    onApply(localFilters, localSort)
    onClose()
  }

  const handleClear = () => {
    const empty: VehiculoFilters = {}
    setLocalFilters(empty)
    setLocalSort('price_asc')
    onApply(empty, 'price_asc')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl bg-surface-0 border-t border-white/8 max-h-[85svh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <span className="font-semibold text-text-primary">{t('buscar.filter.title')}</span>
          <button
            onClick={onClose}
            aria-label={t('general.close')}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

          {/* Ordenar por */}
          <section>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('buscar.filter.sortBy')}
            </p>
            <SortBar value={localSort} onChange={setLocalSort} />
          </section>

          {/* Transmisión */}
          <section>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('buscar.filter.transmission')}
            </p>
            <div className="flex gap-2">
              {TRANSMISSION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('transmission', localFilters.transmission === opt.value ? null : opt.value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium border transition-all',
                    localFilters.transmission === opt.value
                      ? 'bg-gradient-to-br from-client to-brand-500 text-white border-transparent'
                      : 'bg-surface-1 text-text-secondary border-white/10',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Rango de precio */}
          <section>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('buscar.filter.priceRange')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">{t('buscar.filter.minPrice')}</label>
                <input
                  type="number" min={0} placeholder="0"
                  value={localFilters.minPrice ?? ''}
                  onChange={e => set('minPrice', e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 rounded-xl bg-surface-1 border border-white/8 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">{t('buscar.filter.maxPrice')}</label>
                <input
                  type="number" min={0} placeholder="∞"
                  value={localFilters.maxPrice ?? ''}
                  onChange={e => set('maxPrice', e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 rounded-xl bg-surface-1 border border-white/8 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50"
                />
              </div>
            </div>
          </section>

          {/* Asientos */}
          <section>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('buscar.filter.seats')}
            </p>
            <div className="flex gap-2">
              {SEAT_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => set('minSeats', localFilters.minSeats === n ? null : n)}
                  className={cn(
                    'rounded-full w-10 h-10 text-sm font-medium border transition-all',
                    localFilters.minSeats === n
                      ? 'bg-gradient-to-br from-client to-brand-500 text-white border-transparent'
                      : 'bg-surface-1 text-text-secondary border-white/10',
                  )}
                >
                  {n === 7 ? '7+' : n}
                </button>
              ))}
            </div>
          </section>

          {/* Año */}
          <section>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('buscar.filter.year')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">{t('buscar.filter.yearFrom')}</label>
                <input
                  type="number" min={1990} max={CURRENT_YEAR} placeholder="2015"
                  value={localFilters.minYear ?? ''}
                  onChange={e => set('minYear', e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 rounded-xl bg-surface-1 border border-white/8 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">{t('buscar.filter.yearTo')}</label>
                <input
                  type="number" min={1990} max={CURRENT_YEAR} placeholder={String(CURRENT_YEAR)}
                  value={localFilters.maxYear ?? ''}
                  onChange={e => set('maxYear', e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 rounded-xl bg-surface-1 border border-white/8 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50"
                />
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/8 flex gap-3 shrink-0">
          <button
            onClick={handleClear}
            className="flex-1 h-12 rounded-full border border-white/15 text-text-secondary text-sm font-semibold hover:border-white/30 transition-colors"
          >
            {t('buscar.filter.clearAll')}
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-12 rounded-full bg-gradient-to-br from-client to-brand-500 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            {t('buscar.filter.applyFilters')}
          </button>
        </div>
      </div>
    </>
  )
}
