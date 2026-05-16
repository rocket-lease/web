import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { es } from 'date-fns/locale'
import 'react-day-picker/style.css'
import { cn } from '@/lib/utils'

export type CalendarProps = DayPickerProps & { className?: string }

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays
      className={cn('rdp-rocket', className)}
      classNames={{
        month: 'space-y-2',
        month_caption: 'flex justify-center pt-1 pb-2 text-sm font-medium text-text-primary',
        nav: 'flex items-center justify-between absolute top-1 left-2 right-2 pointer-events-none',
        button_previous:
          'pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors',
        button_next:
          'pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-xs text-text-muted font-medium uppercase',
        weeks: 'space-y-1',
        week: 'flex',
        day: 'w-9 h-9 text-sm relative',
        day_button:
          'w-full h-full inline-flex items-center justify-center rounded-full text-text-primary hover:bg-surface-3 transition-colors',
        selected:
          '[&>button]:bg-brand-500 [&>button]:text-white [&>button]:hover:bg-brand-600',
        range_start:
          '[&>button]:bg-brand-500 [&>button]:text-white [&>button]:hover:bg-brand-600 rounded-l-full bg-brand-500/15',
        range_end:
          '[&>button]:bg-brand-500 [&>button]:text-white [&>button]:hover:bg-brand-600 rounded-r-full bg-brand-500/15',
        range_middle:
          '[&>button]:bg-transparent [&>button]:hover:bg-brand-500/30 bg-brand-500/15 rounded-none',
        today: '[&>button]:border [&>button]:border-brand-400/40',
        outside: 'opacity-30',
        disabled: 'opacity-20 [&>button]:pointer-events-none',
        hidden: 'invisible',
      }}
      {...props}
    />
  )
}
