import { useState } from 'react'
import { BellRinging, X, CaretDown, Export } from '@phosphor-icons/react'
import type { usePushNotifications } from '@/features/pwa/hooks/usePushNotifications'
import { t } from '@/i18n/es'

const DISMISS_KEY = 'push-prompt-dismissed'

type PushPromptProps = Pick<
  ReturnType<typeof usePushNotifications>,
  'permissionState' | 'isLoading' | 'subscribe'
>

/**
 * Soft-prompt proactivo para activar las notificaciones push. Aparece arriba del
 * centro de notificaciones solo cuando hay algo accionable (falta otorgar el
 * permiso o falta instalar la PWA en iOS) y desaparece apenas el usuario otorga el
 * permiso. No es un panel de ajustes: es una invitación discreta y descartable.
 */
export function PushPrompt({ permissionState, isLoading, subscribe }: PushPromptProps) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [showSteps, setShowSteps] = useState(false)

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  // Nada accionable o ya descartado: no mostramos nada. Apenas el permiso queda
  // otorgado, el prompt cumplió su objetivo y desaparece (la suscripción en sí es
  // un detalle de implementación que ocurre en segundo plano).
  if (dismissed) return null
  if (permissionState === 'unsupported' || permissionState === 'denied') return null
  if (permissionState === 'granted') return null

  const needsInstall = permissionState === 'needs-install'

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-500/[0.06]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15">
          <BellRinging size={18} weight="fill" className="text-brand-400" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-text-primary">
            {needsInstall ? t('push.needsInstall') : t('push.promptTitle')}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-text-muted">
            {needsInstall ? t('push.needsInstall.hint') : t('push.subtitle')}
          </p>
        </div>

        {needsInstall ? (
          <button
            type="button"
            onClick={() => setShowSteps(s => !s)}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-400 transition-colors hover:bg-brand-500/10"
          >
            {t('push.installCta')}
            <CaretDown size={12} weight="bold" className={showSteps ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void subscribe()}
            disabled={isLoading}
            className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? '…' : t('push.enableShort')}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label={t('push.dismiss')}
          className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:text-text-secondary"
        >
          <X size={15} weight="bold" />
        </button>
      </div>

      {needsInstall && showSteps && (
        <ol className="space-y-2 border-t border-brand-500/15 px-3.5 py-3">
          {[
            { n: 1, text: t('push.needsInstall.step1'), icon: <Export size={13} className="text-brand-400" /> },
            { n: 2, text: t('push.needsInstall.step2'), icon: null },
            { n: 3, text: t('push.needsInstall.step3'), icon: null },
          ].map(step => (
            <li key={step.n} className="flex items-center gap-2.5 text-xs text-text-secondary">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-[10px] font-bold text-brand-400">
                {step.n}
              </span>
              <span className="flex items-center gap-1.5">
                {step.text}
                {step.icon}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
