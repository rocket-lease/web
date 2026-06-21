import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { usePushNotifications } from '@/features/pwa/hooks/usePushNotifications'
import { NotificationList } from '@/features/notificaciones/components/NotificationList'
import { PushPrompt } from '@/features/notificaciones/components/PushPrompt'
import { t } from '@/i18n/es'

function NotificacionesPage() {
  const { permissionState, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

  return (
    <div className="flex flex-col pb-20">
      <PageHeader title={t('push.title')} showBack />

      <div className="px-5 py-6 space-y-4">
        <PushPrompt
          permissionState={permissionState}
          isLoading={isLoading}
          subscribe={subscribe}
        />

        <NotificationList />

        {permissionState === 'granted' && isSubscribed && (
          <div className="pt-3 text-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void unsubscribe()}
              className="text-xs text-text-muted transition-colors hover:text-text-secondary disabled:opacity-50"
            >
              {t('push.manageDisable')}
            </button>
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
