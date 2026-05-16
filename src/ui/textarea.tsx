import * as React from 'react'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-xl border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
