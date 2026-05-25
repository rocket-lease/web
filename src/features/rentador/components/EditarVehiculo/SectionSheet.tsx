import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Drawer, DrawerContent } from '@/ui/drawer'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface SectionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  isSaving: boolean
  canSave?: boolean
  onSave: () => void
  children: ReactNode
}

/**
 * Wrapper para los sheets de edición por sección. Maneja header con título,
 * footer con Cancelar / Guardar, y bloqueo durante el save.
 */
export function SectionSheet({
  open,
  onOpenChange,
  title,
  description,
  isSaving,
  canSave = true,
  onSave,
  children,
}: SectionSheetProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={(next) => { if (!isSaving) onOpenChange(next) }}
      modal={false}
    >
      <DrawerContent>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="min-w-0">
            <p className="font-semibold text-text-primary">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs text-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 pb-4 space-y-4">
          {children}
        </div>

        <div className="border-t border-white/6 bg-surface-1 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('general.cancel')}
            </Button>
            <Button
              onClick={onSave}
              disabled={!canSave || isSaving}
            >
              {isSaving ? t('editVehiculo.saving') : t('general.save')}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
