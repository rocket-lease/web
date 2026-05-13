import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import type { SortCriteria } from '../types'

const SORT_OPTIONS: { key: SortCriteria; label: string }[] = [
  { key: 'price_asc',  label: t('buscar.sort.priceAsc') },
  { key: 'price_desc', label: t('buscar.sort.priceDesc') },
  { key: 'rating',     label: t('buscar.sort.rating') },
]

interface SortBarProps {
  value:    SortCriteria
  onChange: (sort: SortCriteria) => void
}

export function SortBar({ value, onChange }: SortBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {SORT_OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 border',
            value === opt.key
              ? 'bg-gradient-to-br from-client to-brand-500 text-white border-transparent'
              : 'bg-surface-1 text-text-secondary border-white/10',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
