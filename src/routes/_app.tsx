import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import {
  MagnifyingGlass,
  CalendarCheck,
  Car,
  Heart,
  UserCircle,
  ChartBar,
  ClipboardText,
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

/**
 * Rutas de tarea (detalle de vehículo, flujo de reserva, detalle de reserva y
 * transferencia) que se muestran sin el chrome global de navegación: header
 * superior y bottom nav se ocultan para dejar la pantalla enfocada en la tarea,
 * con el header propio de cada página. El listado `/reservas` (tab) conserva el
 * chrome; solo los detalles `/reservas/:id` son inmersivos.
 */
function isImmersiveRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/vehiculos/') ||
    pathname.startsWith('/reservas/') ||
    pathname.startsWith('/reservas-transferencia/')
  )
}

function AppLayout() {
  const { activeRole } = useAuth()
  const queryClient = useQueryClient()
  const immersive = useRouterState({
    select: (s) => isImmersiveRoute(s.location.pathname),
  })

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
        <VerificationBanner />

        <main className={immersive ? 'flex-1' : 'flex-1 pb-24'}>
          <Outlet />
        </main>
        {!immersive && <BottomNav tabs={tabs} activeRole={role} />}
      </div>
    </PullToRefresh>
  )
}
