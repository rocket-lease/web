import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { Drawer, DrawerContent, DrawerTrigger } from './drawer'
import { Calendar } from './calendar'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface DateRangeSheetProps {
  /** Rango actual (controlado). */
  value: { from?: string; to?: string }
  /** Se llama con strings ISO `yyyy-MM-dd` al aplicar. `null` = limpiar. */
  onApply: (range: { from?: string; to?: string }) => void
  /** Texto cuando no hay rango. */
  placeholder?: string
  /** Texto del header del sheet. */
  title?: string
  className?: string
}

function toDate(iso?: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(date?: Date): string | undefined {
  if (!date) return undefined
  return format(date, 'yyyy-MM-dd')
}

function fmtLabel(from?: Date, to?: Date): string | null {
  if (!from && !to) return null
  if (from && to) {
    return `${format(from, "d 'de' MMM", { locale: es })} – ${format(to, "d 'de' MMM yyyy", { locale: es })}`
  }
  if (from) return `Desde ${format(from, "d 'de' MMM yyyy", { locale: es })}`
  return `Hasta ${format(to!, "d 'de' MMM yyyy", { locale: es })}`
}

export function DateRangeSheet({
  value,
  onApply,
  placeholder = 'Filtrar por fecha',
  title = 'Elegí un rango',
  className,
}: DateRangeSheetProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(() => ({
    from: toDate(value.from),
    to: toDate(value.to),
  }))

  // Sincronizar el draft con el value cuando el sheet se abre, así si el padre
  // cambia el value externamente, el calendar arranca consistente.
  useEffect(() => {
    if (open) {
      setDraft({ from: toDate(value.from), to: toDate(value.to) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const label = fmtLabel(toDate(value.from), toDate(value.to))
  const hasRange = Boolean(value.from || value.to)

  const apply = () => {
    onApply({ from: toIso(draft?.from), to: toIso(draft?.to) })
    setOpen(false)
  }
  const clear = () => {
    setDraft(undefined)
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
              selected={draft}
              onSelect={setDraft}
              numberOfMonths={1}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={clear} className="flex-1">
              Limpiar
            </Button>
            <Button onClick={apply} className="flex-1" disabled={!draft?.from && !draft?.to}>
              Aplicar
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
