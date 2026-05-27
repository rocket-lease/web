import { Drawer as VaulDrawer } from 'vaul'
import { cn } from '@/lib/utils'

const Drawer = VaulDrawer.Root
const DrawerTrigger = VaulDrawer.Trigger
const DrawerClose = VaulDrawer.Close
const DrawerPortal = VaulDrawer.Portal
const DrawerTitle = VaulDrawer.Title
const DrawerDescription = VaulDrawer.Description

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm', className)}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <VaulDrawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border-t border-white/8 bg-surface-1 outline-none',
          className,
        )}
        {...props}
      >
        <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-surface-3" />
        {children}
      </VaulDrawer.Content>
    </DrawerPortal>
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
}
