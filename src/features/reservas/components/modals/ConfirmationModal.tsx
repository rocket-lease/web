import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

interface ConfirmationModalProps {
  title: string
  body: string
  confirmLabel: string
  submittingLabel: string
  submitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal genérico de confirmación con cuerpo libre + dos botones (cancelar /
 * confirmar primary). Diseñado para usarse tanto standalone (sobre una pantalla
 * de detalle) como anidado dentro de un `<Link>` u otro elemento con handler
 * de click — todos los handlers detienen propagación y previenen el default
 * para que clickear el modal no dispare acciones del contenedor.
 *
 * Lockea el scroll del body mientras está montado. Se monta condicionalmente
 * (no es portal), así que el caller decide cuándo aparece pasando un
 * `&& <ConfirmationModal />`.
 */
export function ConfirmationModal({
  title,
  body,
  confirmLabel,
  submittingLabel,
  submitting,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useLockBodyScroll()
  const handle = (cb: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    cb()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={handle(onCancel)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-white/8 p-6 shadow-elevated my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{body}</p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="ghost" disabled={submitting} onClick={handle(onCancel)}>
            {t('rentador.reservas.rechazar.cancelar')}
          </Button>
          <Button disabled={submitting} onClick={handle(onConfirm)}>
            {submitting ? submittingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
