import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-600/20 text-brand-300 border border-brand-600/30',
        secondary: 'bg-surface-2 text-text-secondary border border-white/8',
        success: 'bg-success-bg text-success border border-success/20',
        warning: 'bg-warning-bg text-warning border border-warning/20',
        danger: 'bg-danger-bg text-danger border border-danger/20',
        info: 'bg-info-bg text-info border border-info/20',
        outline: 'border border-current bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
