import type React from 'react'
import { SearchX } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/ui/accordion'
import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'
import type { FaqItem, FaqCategoryId } from '../types'

const categoryColors: Record<FaqCategoryId, string> = {
  reservas: 'bg-brand-600/20 text-brand-300',
  pagos: 'bg-success-bg text-success',
  vehiculos: 'bg-info-bg text-info',
  cuenta: 'bg-warning-bg text-warning',
  disputas: 'bg-danger-bg text-danger',
}

const categoryLabels: Record<FaqCategoryId, string> = {
  reservas: 'Reservas',
  pagos: 'Pagos',
  vehiculos: 'Vehículos',
  cuenta: 'Cuenta',
  disputas: 'Disputas',
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-brand-400/25 text-brand-200 rounded px-0.5 not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

interface FaqAccordionProps {
  items: FaqItem[]
  query: string
  onClearSearch: () => void
}

export function FaqAccordion({ items, query, onClearSearch }: FaqAccordionProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
          <SearchX className="h-8 w-8 text-text-muted" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">Sin resultados</p>
          <p className="mt-1 text-sm text-text-secondary">
            No encontramos preguntas que coincidan con tu búsqueda.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClearSearch}>
          Limpiar búsqueda
        </Button>
      </div>
    )
  }

  return (
    <Accordion type="multiple" className="rounded-2xl bg-surface-1 border border-white/6 overflow-hidden">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className={cn('py-0', index === 0 && 'first:[&]:border-t-0')}
        >
          <AccordionTrigger className="rounded-none gap-3 px-4 py-4">
            <div className="flex flex-col items-start gap-2 text-left">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  categoryColors[item.categoryId],
                )}
              >
                {categoryLabels[item.categoryId]}
              </span>
              <span className="text-sm font-semibold text-text-primary leading-snug">
                {highlightText(item.question, query)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-text-secondary leading-relaxed">
              {highlightText(item.answer, query)}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
