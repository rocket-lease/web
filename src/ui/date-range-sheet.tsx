import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from './drawer'
import { Calendar, type DateRange } from './calendar'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface DateRangeSheetProps {
  /** Rango actual (controlado). Strings ISO `yyyy-MM-dd`. */
  value: DateRange
  /** Se llama con strings ISO `yyyy-MM-dd` al aplicar. */
  onApply: (range: DateRange) => void
  /** Texto cuando no hay rango. */
  placeholder?: string
  /** Texto del header del sheet. */
  title?: string
  className?: string
}

const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parse(iso?: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmtLabel(value: DateRange): string | null {
  const from = parse(value.from)
  const to = parse(value.to)
  if (!from && !to) return null
  const day = (d: Date) => `${d.getDate()} de ${MONTH_SHORT[d.getMonth()]}`
  const dayY = (d: Date) => `${d.getDate()} de ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
  if (from && to) return `${day(from)} – ${dayY(to)}`
  if (from) return `Desde ${dayY(from)}`
  return `Hasta ${dayY(to!)}`
}

/**
 * Trigger button + bottom sheet con calendario inline para seleccionar un
 * rango de fechas. Mobile-first: el sheet sube desde abajo, respeta
 * safe-area-inset, soporta swipe-to-close.
 *
 * El componente mantiene un `draft` interno mientras el usuario juguetea con
 * el calendario; solo cuando aprieta "Aplicar" llama `onApply` con el rango
 * final. "Limpiar" descarta y llama `onApply` con `{from: undefined, to: undefined}`.
 *
 * @param props.value - Rango actual (controlado por el padre).
 * @param props.onApply - Callback con el rango elegido al apretar Aplicar/Limpiar.
 * @param props.placeholder - Texto del trigger cuando no hay rango activo.
 * @param props.title - Título arriba del calendario en el sheet.
 */
export function DateRangeSheet({
  value,
  onApply,
  placeholder = 'Filtrar por fecha',
  title = 'Elegí un rango',
  className,
}: DateRangeSheetProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)

  useEffect(() => {
    if (open) setDraft(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const label = fmtLabel(value)
  const hasRange = Boolean(value.from || value.to)

  const apply = () => {
    onApply(draft)
    setOpen(false)
  }
  const clear = () => {
    setDraft({ from: undefined, to: undefined })
    onApply({ from: undefined, to: undefined })
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-left text-sm border border-white/6 transition-colors hover:bg-surface-3',
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 text-brand-400 shrink-0" />
          <span className={cn('flex-1 truncate', hasRange ? 'text-text-primary' : 'text-text-muted')}>
            {label ?? placeholder}
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col gap-4 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="text-center">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <p className="text-xs text-text-muted mt-1">
              Tocá un día para inicio, otro para fin.
            </p>
          </div>

          <div className="flex justify-center">
            <Calendar
              mode="range"
              value={draft}
              onChange={setDraft}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={clear} className="flex-1">
              Limpiar
            </Button>
            <Button onClick={apply} className="flex-1" disabled={!draft.from && !draft.to}>
              Aplicar
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
