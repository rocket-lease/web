import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { CalendarBlank, X } from '@phosphor-icons/react'
import 'react-day-picker/style.css'

type DateRange = { from?: Date; to?: Date }

// DayPicker v10 crea fechas como UTC midnight — extraemos la fecha en UTC para evitar off-by-one en GMT-3
const toISODate = (d: Date) => d.toISOString().split('T')[0]

const formatLabel = (iso: string) => {
  const [, m, d] = iso.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate?: string, endDate?: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<DateRange | undefined>()

  const handleSelect = (range: DateRange | undefined) => {
    setInternal(range)
    if (!range?.from) { onChange(undefined, undefined); return }
    const sameDay = range.to && toISODate(range.from) === toISODate(range.to)
    const from = toISODate(range.from)
    const to   = !sameDay && range.to ? toISODate(range.to) : undefined
    onChange(from, to)
    if (to) setOpen(false)
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInternal(undefined)
    onChange(undefined, undefined)
  }

  const label = startDate
    ? endDate
      ? `${formatLabel(startDate)} – ${formatLabel(endDate)}`
      : `Desde ${formatLabel(startDate)}`
    : undefined

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 h-10 rounded-full border px-3 text-sm transition-colors ${
          startDate
            ? 'bg-brand-500/10 border-brand-500/40 text-brand-300'
            : 'bg-surface-1 border-white/8 text-text-muted'
        }`}
      >
        <CalendarBlank size={14} className={startDate ? 'text-brand-400' : 'text-text-muted'} />
        <span className="text-xs font-medium whitespace-nowrap">
          {label ?? 'Fechas'}
        </span>
        {startDate && (
          <span
            role="button"
            onClick={clear}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={10} />
          </span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 z-50 rounded-2xl bg-surface-1 border border-white/8 shadow-elevated p-3">
            <DayPicker
              mode="range"
              selected={internal}
              onSelect={handleSelect}
              locale={es}
              disabled={{ before: new Date() }}
              numberOfMonths={1}
              classNames={{
                root:        'rdp-root text-text-primary text-sm',
                month_grid:  'w-full border-collapse',
                day:         'rdp-day h-9 w-9 rounded-full text-center transition-colors hover:bg-surface-2',
                day_button:  'w-full h-full flex items-center justify-center rounded-full',
                selected:    'bg-brand-500 text-white',
                range_start: 'bg-brand-500 text-white rounded-l-full',
                range_end:   'bg-brand-500 text-white rounded-r-full',
                range_middle:'bg-brand-500/20 text-brand-200 rounded-none',
                today:       'font-bold text-brand-400',
                disabled:    'text-text-muted opacity-30 cursor-not-allowed',
                nav:         'flex items-center justify-between mb-2',
                chevron:     'text-text-secondary',
                month_caption:'text-sm font-semibold text-text-primary text-center py-2',
                weekdays:    'flex',
                weekday:     'w-9 text-center text-xs text-text-muted font-medium py-1',
                week:        'flex',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
