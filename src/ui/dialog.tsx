import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

const DialogRoot = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  return (
    <Dialog.Provider value={{ open: actualOpen, setOpen: setOpen as (open: boolean) => void }}>
      {children}
    </Dialog.Provider>
  )
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const dialog = React.useContext(Dialog)
    return (
      <button
        ref={ref}
        onClick={(e) => {
          dialog.setOpen(true)
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)
DialogTrigger.displayName = 'DialogTrigger'

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const dialog = React.useContext(Dialog)

    if (!dialog.open) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
      // Only close if clicking directly on the overlay, not on content or its children
      if (e.target === e.currentTarget) {
        dialog.setOpen(false)
      }
    }

    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
        <div
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/8 bg-surface-1 p-6 shadow-lg rounded-xl sm:rounded-2xl max-h-[90vh] overflow-y-auto',
            className
          )}
          {...props}
        >
          <button
            onClick={() => dialog.setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface-1 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </>
    )
  }
)
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)} {...props} />
  )
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-text-muted', className)} {...props} />
  )
)
DialogDescription.displayName = 'DialogDescription'

export { DialogRoot as Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }

