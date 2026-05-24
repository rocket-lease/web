import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, disabled, className, ...props }, ref) => {
    const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0

    return (
      <div className={cn('relative w-full py-2', className)}>
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
    )
  },
)
Slider.displayName = 'Slider'
