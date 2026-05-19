import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextType {
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('Select context not found')
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const Select = ({ children, value = '', onValueChange, disabled = false }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(value)
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined

  const handleChange = (newValue: string) => {
    if (!isControlled) setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider
      value={{
        value: isControlled ? value : internalValue,
        onChange: handleChange,
        open,
        setOpen: disabled ? () => {} : setOpen,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-white/8 bg-surface-2 px-4 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

const SelectValue = ({ placeholder = 'Select...', children }: SelectValueProps) => {
  const { value } = useSelectContext()
  return <span>{children || value || placeholder}</span>
}

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelectContext()

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full left-0 right-0 z-[9999] mt-1 max-h-96 min-w-[8rem] overflow-y-auto rounded-xl border border-white/8 bg-surface-2 text-text-primary shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onChange } = useSelectContext()
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        role="option"
        onClick={() => onChange(value)}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-surface-1 focus:bg-surface-1 focus:text-text-primary',
          isSelected && 'bg-surface-1 text-text-primary',
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }

