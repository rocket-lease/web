import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] touch-manipulation',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600',
        secondary:
          'rounded-xl bg-surface-2 text-text-primary hover:bg-surface-3 border border-white/8',
        ghost:
          'rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2',
        outline:
          'rounded-full border border-brand-500/50 text-brand-500 hover:bg-brand-500/10',
        destructive:
          'rounded-xl bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30',
        link: 'text-brand-500 underline-offset-4 hover:underline p-0 h-auto rounded-none',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-10 w-10 rounded-full',
        'icon-sm': 'h-8 w-8 rounded-full',
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
