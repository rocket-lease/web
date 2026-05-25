import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { t } from '@/i18n/es'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  consequences?: string
  confirmLabel: string
  /**
   * Si se setea, el usuario debe tipear esta palabra para habilitar el botón
   * de confirmar. Para acciones más destructivas (eliminar vehículo, eliminar
   * cuenta, etc).
   */
  confirmWord?: string
  destructive?: boolean
  loading?: boolean
}

/**
 * Modal genérico de confirmación. Reemplaza al `window.confirm` nativo para
 * acciones destructivas. Si `confirmWord` viene seteado, exige tipear la
 * palabra para habilitar el botón de confirmar.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  consequences,
  confirmLabel,
  confirmWord,
  destructive = true,
  loading = false,
}: ConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (!open) {
      setConfirmText('')
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const canConfirm = confirmWord
    ? confirmText.trim().toUpperCase() === confirmWord.toUpperCase()
    : true

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={loading ? undefined : onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl bg-surface-1 ${destructive ? 'border border-danger/30' : 'border border-white/10'} p-6 shadow-elevated my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {destructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label={t('general.cancel')}
            className="text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {consequences && (
          <div
            className={`rounded-xl ${destructive ? 'bg-danger/10 border border-danger/20' : 'bg-surface-2 border border-white/10'} px-3 py-3 mb-4`}
          >
            <p className="text-xs text-text-secondary">{consequences}</p>
          </div>
        )}

        {confirmWord && (
          <>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
              Escribí <span className="font-bold">{confirmWord}</span> para confirmar
            </label>
            <Input
              autoComplete="off"
              placeholder={confirmWord}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
            />
          </>
        )}

        <div className={`${confirmWord ? 'mt-5' : ''} flex flex-col gap-2`}>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={!canConfirm || loading}
            onClick={onConfirm}
            className="w-full"
          >
            {loading ? `${confirmLabel}...` : confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full">
            {t('general.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
