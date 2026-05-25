import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

/**
 * Switch (toggle) sin radix — botón controlado con estilo brand.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, id, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand-500' : 'bg-surface-2',
          className,
        )}
        {...rest}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
          aria-hidden
        />
      </button>
    )
  },
)
Switch.displayName = 'Switch'
