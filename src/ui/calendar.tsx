import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const WEEKDAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseYmd(s: string): Date {
  return new Date(`${s}T00:00:00`)
}

export interface DateRange {
  from?: string
  to?: string
}

interface BaseProps {
  /** Fecha mínima seleccionable (inclusive), formato YYYY-MM-DD. */
  minDate?: string
  /** Override de fechas deshabilitadas (además de minDate). */
  isDateDisabled?: (dateStr: string) => boolean
  className?: string
}

interface SingleProps extends BaseProps {
  mode: 'single'
  value: string
  onChange: (date: string) => void
}

interface RangeProps extends BaseProps {
  mode: 'range'
  value: DateRange
  onChange: (range: DateRange) => void
}

export type CalendarProps = SingleProps | RangeProps

/**
 * Calendario inline custom. Soporta selección de una sola fecha o rango,
 * navegación mes-a-mes con chevrons, locale español (lunes-primero), y
 * estilos consistentes con el theme dark/purple del proyecto.
 *
 * Para selección de rango aplica el patrón "tap-to-reset" tipo Airbnb:
 * - Sin selección → primer tap setea `from`.
 * - Con `from` y tap posterior → setea `to` (si tap > from) o reinicia
 *   desde el nuevo día (si tap < from).
 * - Con rango completo y nuevo tap → reinicia el rango desde ese día.
 *
 * @param props.mode - `'single'` o `'range'`. Determina el shape de
 *   `value`/`onChange` (discriminated union).
 * @param props.value - Fecha YYYY-MM-DD (mode single) o `{from?, to?}` (range).
 * @param props.onChange - Callback con el nuevo valor seleccionado.
 * @param props.minDate - Opcional: día más temprano seleccionable (YYYY-MM-DD).
 *   Los días anteriores quedan deshabilitados y tachados.
 * @param props.isDateDisabled - Opcional: hook custom para deshabilitar días
 *   adicionales (ej. fechas ocupadas).
 */
export function Calendar(props: CalendarProps) {
  const { mode, minDate, isDateDisabled, className } = props

  const reference =
    mode === 'single'
      ? props.value || minDate || formatYmd(new Date())
      : props.value.from || minDate || formatYmd(new Date())
  const refDate = parseYmd(reference)
  const [viewYear, setViewYear] = useState(refDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(refDate.getMonth())

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  // 0=Sunday → 6, 1=Mon → 0 (lunes primero).
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: Array<{ date: string; day: number } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: formatYmd(new Date(viewYear, viewMonth, d)), day: d })
  }

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handlePick = (date: string) => {
    if (mode === 'single') {
      props.onChange(date)
      return
    }
    const { from, to } = props.value
    if (from && to) {
      props.onChange({ from: date, to: undefined })
      return
    }
    if (from && !to && date < from) {
      props.onChange({ from: date, to: undefined })
      return
    }
    if (!from) {
      props.onChange({ from: date, to: undefined })
      return
    }
    props.onChange({ from, to: date })
  }

  type Visual = 'none' | 'start' | 'end' | 'middle' | 'single'
  const visualFor = (date: string): Visual => {
    if (mode === 'single') {
      return date === props.value ? 'single' : 'none'
    }
    const { from, to } = props.value
    if (!from && !to) return 'none'
    if (from && !to) return date === from ? 'single' : 'none'
    if (from === to && date === from) return 'single'
    if (date === from) return 'start'
    if (date === to) return 'end'
    if (from && to && date > from && date < to) return 'middle'
    return 'none'
  }

  return (
    <div
      className={cn(
        'w-72 rounded-2xl border border-white/8 bg-surface-1 p-3',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-secondary"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary capitalize">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-secondary"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[10px] text-text-muted py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />
          const disabled =
            (!!minDate && c.date < minDate) ||
            (isDateDisabled?.(c.date) ?? false)
          const visual = visualFor(c.date)

          // Background del CELL (para el efecto continuo del range).
          const cellBg =
            visual === 'middle'
              ? 'bg-brand-500/15'
              : visual === 'start'
                ? 'bg-brand-500/15 rounded-l-lg'
                : visual === 'end'
                  ? 'bg-brand-500/15 rounded-r-lg'
                  : ''

          const buttonStyle =
            visual === 'start' || visual === 'end' || visual === 'single'
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : visual === 'middle'
                ? 'text-text-primary hover:bg-brand-500/30'
                : disabled
                  ? 'text-text-muted/40 line-through cursor-not-allowed'
                  : 'text-text-primary hover:bg-surface-2'

          return (
            <div key={c.date} className={cellBg}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick(c.date)}
                className={cn(
                  'h-9 w-full rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  buttonStyle,
                )}
              >
                {c.day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
