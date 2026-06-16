import { createFileRoute } from '@tanstack/react-router'
import { Bell, BellRinging, BellSlash, Export, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { usePushNotifications } from '@/features/pwa/hooks/usePushNotifications'
import { NotificationList } from '@/features/notificaciones/components/NotificationList'
import { t } from '@/i18n/es'

function NotificacionesPage() {
  const { permissionState, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

  return (
    <div className="flex flex-col pb-20">
      <PageHeader title={t('push.title')} showBack />

      <div className="px-5 py-6 space-y-6">
        <NotificationList />

        <div className="border-t border-white/6 pt-6">
          <p className="text-sm font-semibold text-text-primary">{t('notificaciones.pushSettings')}</p>
          <p className="text-xs text-text-muted mt-0.5">{t('notificaciones.pushSettingsHint')}</p>
        </div>

        {/* Estado activo */}
        {permissionState === 'granted' && isSubscribed && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
                <BellRinging size={20} className="text-success" weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t('push.active')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('push.active.hint')}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={() => void unsubscribe()}
            >
              {isLoading ? t('general.loading') : t('push.disable')}
            </Button>
          </div>
        )}

        {/* Listo para activar */}
        {(permissionState === 'prompt' || (permissionState === 'granted' && !isSubscribed)) && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2">
                <Bell size={20} className="text-text-secondary" weight="regular" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t('push.title')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('push.subtitle')}</p>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() => void subscribe()}
            >
              {isLoading ? t('general.loading') : t('push.enable')}
            </Button>
          </div>
        )}

        {/* Denegado */}
        {permissionState === 'denied' && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15">
              <BellSlash size={20} className="text-danger" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('push.denied')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('push.denied.hint')}</p>
            </div>
          </div>
        )}

        {/* No soportado */}
        {permissionState === 'unsupported' && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2">
              <BellSlash size={20} className="text-text-muted" weight="regular" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('push.unsupported')}</p>
            </div>
          </div>
        )}

        {/* iOS — necesita instalación */}
        {permissionState === 'needs-install' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/15">
                <Bell size={20} className="text-info" weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t('push.needsInstall')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('push.needsInstall.hint')}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-surface-1 divide-y divide-white/6">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">1</span>
                <span className="text-sm text-text-primary">{t('push.needsInstall.step1')}</span>
                <Export size={16} className="text-info shrink-0 ml-auto" />
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">2</span>
                <span className="text-sm text-text-primary">{t('push.needsInstall.step2')}</span>
                <ArrowSquareOut size={16} className="text-text-muted shrink-0 ml-auto" />
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">3</span>
                <span className="text-sm text-text-primary">{t('push.needsInstall.step3')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NotificacionesRoute() {
  return (
    <AuthGate>
      <NotificacionesPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/notificaciones')({
  component: NotificacionesRoute,
})
