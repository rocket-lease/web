import { ArrowSquareOut, ChatCircleDots, Clock, Envelope, SpinnerGap, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import { useContactSupport } from '../hooks/useContactSupport'

export function SoporteContactCard() {
  const contactSupport = useContactSupport()

  async function handleChat() {
    try {
      await contactSupport.mutateAsync(undefined)
    } catch {
      toast.error(t('error.default'))
    }
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-white/6 p-4">
      <p className="text-sm font-semibold text-text-primary mb-1">
        {t('soporte.contact.title')}
      </p>

      <div className="divide-y divide-white/6">
        {/* Chat en la app — crea/recupera ticket support_request */}
        <button
          type="button"
          onClick={() => void handleChat()}
          disabled={contactSupport.isPending}
          className={cn(
            'w-full text-left hover:bg-surface-2 rounded-xl transition-colors px-1 disabled:opacity-60',
          )}
        >
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 border border-brand-600/20">
              {contactSupport.isPending
                ? <SpinnerGap className="h-4 w-4 text-brand-400 animate-spin" weight="bold" />
                : <ChatCircleDots className="h-4 w-4 text-brand-400" weight="duotone" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">{t('soporte.contact.chat')}</p>
              <p className="text-sm font-medium text-brand-400">{t('soporte.contactar.cta')}</p>
            </div>
          </div>
        </button>

        <a
          href="https://wa.me/5411345678900"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-surface-2 rounded-xl transition-colors px-1"
        >
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 border border-brand-600/20">
              <WhatsappLogo className="h-4 w-4 text-brand-400" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">{t('soporte.contact.whatsapp')}</p>
              <p className="text-sm font-medium text-text-primary">+54 11 3456-7890</p>
            </div>
            <ArrowSquareOut className="h-4 w-4 text-text-muted shrink-0" />
          </div>
        </a>

        <a
          href="mailto:hola@rocketlease.com"
          className="block hover:bg-surface-2 rounded-xl transition-colors px-1"
        >
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 border border-brand-600/20">
              <Envelope className="h-4 w-4 text-brand-400" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">{t('soporte.contact.email')}</p>
              <p className="text-sm font-medium text-text-primary">{t('soporte.contact.emailValue')}</p>
            </div>
            <ArrowSquareOut className="h-4 w-4 text-text-muted shrink-0" />
          </div>
        </a>

        <div className="px-1">
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 border border-brand-600/20">
              <Clock className="h-4 w-4 text-brand-400" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">{t('soporte.contact.hoursLabel')}</p>
              <p className="text-sm font-medium text-text-primary">{t('soporte.contact.hours')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
