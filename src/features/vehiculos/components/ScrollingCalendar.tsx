import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export interface DateRange {
  from?: string
  to?: string
}

interface ScrollingCalendarProps {
  value:         DateRange
  onChange:      (range: DateRange) => void
  monthsToShow?: number
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Calendario vertical de scroll continuo. Renderiza N meses en columna
 * (default 18 = 1.5 años), cada uno con su título; los días de la semana NO
 * viven adentro de este componente: el padre los muestra fijos como header
 * sticky.
 *
 * Selección de rango con patrón "tap-to-reset" tipo Airbnb. Días anteriores
 * a hoy quedan deshabilitados.
 */
export function ScrollingCalendar({ value, onChange, monthsToShow = 18 }: ScrollingCalendarProps) {
  const todayStr = useMemo(() => formatYmd(new Date()), [])

  const months = useMemo(() => {
    const today = new Date()
    return Array.from({ length: monthsToShow }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }, [monthsToShow])

  const handlePick = (date: string) => {
    const { from, to } = value
    if (from && to) { onChange({ from: date, to: undefined }); return }
    if (from && !to && date < from) { onChange({ from: date, to: undefined }); return }
    if (!from) { onChange({ from: date, to: undefined }); return }
    onChange({ from, to: date })
  }

  type Visual = 'none' | 'start' | 'end' | 'middle' | 'single'
  const visualFor = (date: string): Visual => {
    const { from, to } = value
    if (!from && !to) return 'none'
    if (from && !to) return date === from ? 'single' : 'none'
    if (date === from && date === to) return 'single'
    if (date === from) return 'start'
    if (date === to) return 'end'
    if (from && to && date > from && date < to) return 'middle'
    return 'none'
  }

  return (
    <div className="px-3 pb-4">
      {months.map((m) => (
        <MonthBlock
          key={`${m.year}-${m.month}`}
          year={m.year}
          month={m.month}
          minDate={todayStr}
          visualFor={visualFor}
          onPick={handlePick}
        />
      ))}
    </div>
  )
}

interface MonthBlockProps {
  year:      number
  month:     number
  minDate:   string
  visualFor: (date: string) => 'none' | 'start' | 'end' | 'middle' | 'single'
  onPick:    (date: string) => void
}

function MonthBlock({ year, month, minDate, visualFor, onPick }: MonthBlockProps) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ date: string; day: number } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: formatYmd(new Date(year, month, d)), day: d })
  }

  return (
    <div className="mb-6">
      <h3 className="px-1 mb-3 text-sm font-semibold text-text-primary capitalize">
        {MONTH_NAMES[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((c, i) => {
          if (!c) return <div key={`empty-${i}`} />
          const disabled = c.date < minDate
          const visual = visualFor(c.date)

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
                  ? 'text-text-muted/40 cursor-not-allowed'
                  : 'text-text-primary hover:bg-surface-2'

          return (
            <div key={c.date} className={cellBg}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(c.date)}
                className={cn(
                  'h-10 w-full rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
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
