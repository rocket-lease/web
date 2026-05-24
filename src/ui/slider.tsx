import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showInput?: boolean
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, disabled, className, showInput, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState(String(value))
    const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0

    React.useEffect(() => {
      setInputValue(String(value))
    }, [value])

    const commitInput = () => {
      const parsed = Number(inputValue)
      if (isNaN(parsed)) {
        setInputValue(String(value))
        return
      }
      const snapped = Math.round(parsed / step) * step
      const clamped = Math.min(max, Math.max(min, snapped))
      onValueChange(clamped)
      setInputValue(String(clamped))
    }

    return (
      <div className={cn('flex items-center gap-3 w-full', className)}>
        <div className="relative flex-1 py-2">
          {/* Track background */}
          <div
            className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2"
            aria-hidden
          />
          {/* Track fill */}
          <div
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
            style={{ width: `${percentage}%` }}
            aria-hidden
          />
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:mt-[-7px]',
              '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-none',
              '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent',
            )}
            {...props}
          />
        </div>

        {showInput && (
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitInput}
            onKeyDown={(e) => e.key === 'Enter' && commitInput()}
            className="w-14 rounded-lg border border-white/8 bg-surface-2 px-2 py-1 text-center text-sm text-text-primary outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        )}
      </div>
    )
  },
)
Slider.displayName = 'Slider'
