import { useState } from 'react'
import { X, Share2, Lock } from 'lucide-react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import type { RuleSetScope } from '@/features/rentador/hooks/useRuleSetScopePreference'

interface RuleSetScopeDialogProps {
  open: boolean
  vehicleName: string
  onChoose: (scope: RuleSetScope, remember: boolean) => void
  onCancel: () => void
}

/**
 * Modal que pregunta al rentador si el set recién creado debe guardarse como
 * compartido (reutilizable) o privado de un vehículo específico.
 *
 * Incluye checkbox "No volver a preguntar" que persiste la preferencia en
 * localStorage vía `useRuleSetScopePreference`.
 */
export function RuleSetScopeDialog({
  open,
  vehicleName,
  onChoose,
  onCancel,
}: RuleSetScopeDialogProps) {
  const [remember, setRemember] = useState(false)

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onCancel}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[71] rounded-t-2xl bg-surface-1 border-t border-white/8 flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <p className="font-semibold text-text-primary">
            {t('reservationRules.scope.title')}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
            aria-label={t('general.cancel')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-3">
          <button
            type="button"
            onClick={() => onChoose('PRIVATE', remember)}
            className="w-full text-left rounded-xl border border-white/8 bg-surface-2 p-4 transition-colors hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">
                  {t('reservationRules.scope.privateTitle')}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {vehicleName
                    ? `${t('reservationRules.scope.privateDescription')} (${vehicleName})`
                    : t('reservationRules.scope.privateDescription')}
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChoose('SHARED', remember)}
            className="w-full text-left rounded-xl border border-white/8 bg-surface-2 p-4 transition-colors hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">
                  {t('reservationRules.scope.sharedTitle')}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {t('reservationRules.scope.sharedDescription')}
                </p>
              </div>
            </div>
          </button>

          <label className="mt-2 flex cursor-pointer items-center gap-2 px-1 pt-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-surface-2 text-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
            <span>{t('reservationRules.scope.rememberChoice')}</span>
          </label>
        </div>

        <div className="border-t border-white/8 px-5 py-3 pb-6">
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
            {t('general.cancel')}
          </Button>
        </div>
      </div>
    </>
  )
}
