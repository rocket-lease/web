import { DateRangeSheet } from '@/ui/date-range-sheet'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate?: string, endDate?: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <DateRangeSheet
      value={{ from: startDate, to: endDate }}
      onApply={({ from, to }) => onChange(from, to)}
      placeholder="Fechas"
      title="Elegí las fechas"
      className="flex-1 min-w-0 h-10 rounded-full py-0 bg-surface-1"
    />
  )
}
