import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import type { SortCriteria } from '../types'

interface SortOption {
  key: SortCriteria
  label: string
  disabled?: boolean
  hint?: string
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'price_asc',  label: t('buscar.sort.priceAsc') },
  { key: 'price_desc', label: t('buscar.sort.priceDesc') },
  { key: 'rating',     label: t('buscar.sort.rating'),   disabled: true, hint: t('buscar.sort.soon') },
  { key: 'distance',   label: t('buscar.sort.distance'), disabled: true, hint: t('buscar.sort.soon') },
]

interface SortBarProps {
  value:    SortCriteria
  onChange: (sort: SortCriteria) => void
}

export function SortBar({ value, onChange }: SortBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {SORT_OPTIONS.map(opt => {
        const selected = value === opt.key && !opt.disabled
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => !opt.disabled && onChange(opt.key)}
            disabled={opt.disabled}
            aria-disabled={opt.disabled}
            title={opt.hint}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 border inline-flex items-center gap-1.5',
              selected
                ? 'bg-gradient-to-br from-client to-brand-500 text-white border-transparent active:scale-95'
                : opt.disabled
                  ? 'bg-surface-1 text-text-muted border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-surface-1 text-text-secondary border-white/10 active:scale-95',
            )}
          >
            <span>{opt.label}</span>
            {opt.disabled && opt.hint && (
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-text-muted">
                {opt.hint}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
