import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function FaqSearch({ value, onChange, className }: FaqSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar preguntas..."
        autoComplete="off"
        aria-label="Buscar en preguntas frecuentes"
        className={cn(
          'h-12 w-full rounded-xl border border-white/8 bg-surface-2 pl-11 pr-10 text-sm text-text-primary placeholder:text-text-muted',
          'transition-colors duration-150',
          'focus:outline-none focus:border-brand-600/60 focus:ring-2 focus:ring-brand-600/20',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
