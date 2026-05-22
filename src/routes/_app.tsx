import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import {
  MagnifyingGlass,
  CalendarCheck,
  Car,
  Headset,
  Heart,
  UserCircle,
  ChartBar,
  ClipboardText,
  Bell,
  MapTrifold,
} from '@phosphor-icons/react'
import { useQueryClient } from '@tanstack/react-query'
import { BottomNav } from '@/features/layout/components/BottomNav'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { VerificationBanner } from '@/features/auth/components/VerificationBanner'
import { PullToRefresh } from '@/features/pwa/components/PullToRefresh'
import { t } from '@/i18n/es'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { activeRole } = useAuth()
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    // Re-sync auth so a stale session does not silently keep showing logged-out UI.
    window.dispatchEvent(new CustomEvent('auth:refresh'))
    await queryClient.invalidateQueries()
  }

  const conductorTabs = [
    { to: '/buscar',      icon: MagnifyingGlass, label: t('nav.buscar') },
    { to: '/mapa',        icon: MapTrifold,      label: t('nav.mapa') },
    { to: '/favoritos',   icon: Heart,           label: t('nav.favoritos') },
    { to: '/reservas',    icon: CalendarCheck,   label: t('nav.reservas') },
    { to: '/soporte',     icon: Headset,         label: t('nav.soporte') },
    { to: '/perfil',      icon: UserCircle,      label: t('nav.perfil') },
  ]

  const rentadorTabs = [
    { to: '/dashboard',     icon: ChartBar,      label: t('nav.dashboard') },
    { to: '/mis-vehiculos', icon: Car,           label: t('nav.misVehiculos') },
    { to: '/reservas',      icon: ClipboardText, label: t('nav.misReservas'), search: { role: 'owner' as const } },
    { to: '/perfil',        icon: UserCircle,    label: t('nav.perfil') },
  ]

  const tabs = activeRole === 'rentador' ? rentadorTabs : conductorTabs
  const role = activeRole === 'rentador' ? 'rentador' : 'conductor'

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex min-h-dvh flex-col bg-surface-0">
        {/* App top bar */}
        <header
          className="flex items-center justify-between px-5 py-3 bg-surface-0/90 backdrop-blur-md sticky top-0 z-40 border-b border-white/5"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
        >
          <img src="/logo-symbol.png" alt="Rocket Lease" className="h-8 w-auto" />
          <Link
            to="/notificaciones"
            aria-label={t('nav.notificaciones')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors active:scale-95"
          >
            <Bell size={22} />
          </Link>
        </header>

        <VerificationBanner />

        <main className="flex-1 pb-24">
          <Outlet />
        </main>
        <BottomNav tabs={tabs} activeRole={role} />
      </div>
    </PullToRefresh>
  )
}
