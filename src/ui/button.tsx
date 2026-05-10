import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] touch-manipulation',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-md hover:opacity-90',
        secondary:
          'bg-surface-2 text-text-primary hover:bg-surface-3 border border-white/8',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-surface-2',
        outline:
          'border border-brand-600/50 text-brand-400 hover:bg-brand-600/10',
        destructive:
          'bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30',
        link: 'text-brand-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-12 px-5 py-2',
        sm: 'h-9 px-4 text-xs rounded-lg',
        lg: 'h-14 px-8 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
