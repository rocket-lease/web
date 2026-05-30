import { useState } from 'react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { RESERVATION_REJECT_REASON_MAX_CHARS } from '../../constants'

interface RejectReasonModalProps {
  submitting: boolean
  onSubmit: (reason: string) => void
  onCancel: () => void
}

/**
 * Modal con textarea para que el rentador deje una razón opcional al rechazar
 * una solicitud (de reserva o de extensión). La razón se valida client-side
 * contra el límite duro de `RESERVATION_REJECT_REASON_MAX_CHARS`; el botón
 * de confirmar queda disabled si lo excede.
 *
 * Todos los handlers detienen propagación y previenen default para que
 * funcione correctamente cuando se monta dentro de un `<Link>` u otro elemento
 * con handler de click (ej. card de la lista).
 */
export function RejectReasonModal({ submitting, onSubmit, onCancel }: RejectReasonModalProps) {
  const [reason, setReason] = useState('')
  useLockBodyScroll()
  const overLimit = reason.length > RESERVATION_REJECT_REASON_MAX_CHARS
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onCancel()
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-white/8 p-6 shadow-elevated my-auto"
        onClick={stop}
      >
        <h2 className="text-lg font-bold text-text-primary">
          {t('rentador.reservas.rechazar.modalTitle')}
        </h2>
        <label className="mt-4 mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('rentador.reservas.rechazar.razonLabel')}
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            e.stopPropagation()
            setReason(e.target.value)
          }}
          onClick={stop}
          placeholder={t('rentador.reservas.rechazar.razonPlaceholder')}
          rows={4}
          maxLength={RESERVATION_REJECT_REASON_MAX_CHARS}
          className="w-full rounded-xl border border-white/8 bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500"
          disabled={submitting}
        />
        <p
          className={`mt-1 text-right text-xs ${
            overLimit ? 'text-danger-400' : 'text-text-muted'
          }`}
        >
          {t('rentador.reservas.rechazar.charCounter').replace(
            '{count}',
            String(reason.length),
          )}
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button
            variant="ghost"
            disabled={submitting}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onCancel()
            }}
          >
            {t('rentador.reservas.rechazar.cancelar')}
          </Button>
          <Button
            variant="destructive"
            disabled={submitting || overLimit}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onSubmit(reason)
            }}
          >
            {submitting
              ? t('rentador.reservas.detalle.rechazando')
              : t('rentador.reservas.rechazar.confirmar')}
          </Button>
        </div>
      </div>
    </div>
  )
}
