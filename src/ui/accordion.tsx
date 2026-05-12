import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionContextValue {
  type: 'single' | 'multiple'
  value: string | string[]
  onToggle: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  type: 'single',
  value: '',
  onToggle: () => {},
})

interface AccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  className?: string
  children: React.ReactNode
}

function Accordion({ type = 'single', defaultValue, className, children }: AccordionProps) {
  const [value, setValue] = React.useState<string | string[]>(
    defaultValue ?? (type === 'multiple' ? [] : ''),
  )

  const onToggle = React.useCallback(
    (id: string) => {
      if (type === 'multiple') {
        setValue(prev =>
          Array.isArray(prev)
            ? prev.includes(id)
              ? prev.filter(v => v !== id)
              : [...prev, id]
            : [id],
        )
      } else {
        setValue(prev => (prev === id ? '' : id))
      }
    },
    [type],
  )

  return (
    <AccordionContext.Provider value={{ type, value, onToggle }}>
      <div className={cn('divide-y divide-white/6', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

function AccordionItem({ value, className, children }: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext)
  const isOpen = Array.isArray(ctx.value) ? ctx.value.includes(value) : ctx.value === value

  return (
    <AccordionItemContext.Provider value={{ id: value, isOpen, onToggle: () => ctx.onToggle(value) }}>
      <div className={cn('py-1', className)}>{children}</div>
    </AccordionItemContext.Provider>
  )
}

interface AccordionItemContextValue {
  id: string
  isOpen: boolean
  onToggle: () => void
}

const AccordionItemContext = React.createContext<AccordionItemContextValue>({
  id: '',
  isOpen: false,
  onToggle: () => {},
})

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, onToggle } = React.useContext(AccordionItemContext)
    return (
      <button
        ref={ref}
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-start justify-between gap-3 py-3 px-4 text-left text-sm font-medium text-text-primary rounded-xl',
          'hover:bg-surface-2 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 mt-0.5',
            isOpen && 'rotate-180',
          )}
        />
      </button>
    )
  },
)
AccordionTrigger.displayName = 'AccordionTrigger'

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext)
    return (
      <div
        ref={ref}
        role="region"
        hidden={!isOpen}
        className={cn(
          'overflow-hidden text-sm text-text-secondary',
          !isOpen && 'hidden',
          className,
        )}
        {...props}
      >
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    )
  },
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
