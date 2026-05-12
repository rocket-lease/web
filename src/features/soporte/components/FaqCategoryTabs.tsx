import { cn } from '@/lib/utils'
import type { FaqCategory, FaqCategoryId } from '../types'

interface FaqCategoryTabsProps {
  categories: FaqCategory[]
  activeCategory: FaqCategoryId | 'all'
  onSelect: (id: FaqCategoryId | 'all') => void
}

export function FaqCategoryTabs({ categories, activeCategory, onSelect }: FaqCategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Categorías de preguntas frecuentes"
      className="flex gap-2 overflow-x-auto no-scrollbar py-1"
    >
      {categories.map(cat => {
        const isActive = cat.id === activeCategory
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-150',
              isActive
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary',
            )}
          >
            <cat.icon className="h-3.5 w-3.5" aria-hidden />
            <span>{cat.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                isActive ? 'bg-white/20 text-white' : 'bg-surface-3 text-text-muted',
              )}
            >
              {cat.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
