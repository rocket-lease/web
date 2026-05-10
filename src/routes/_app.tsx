import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  Search, CalendarCheck, Car, LifeBuoy, UserCircle,
  LayoutDashboard, ClipboardList,
} from 'lucide-react'
import { BottomNav } from '@/features/layout/components/BottomNav'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { activeRole } = useAuth()

  const conductorTabs = [
    { to: '/buscar', icon: Search, label: t('nav.buscar') },
    { to: '/reservas', icon: CalendarCheck, label: t('nav.reservas') },
    { to: '/mis-vehiculos', icon: Car, label: t('nav.misVehiculos') },
    { to: '/soporte', icon: LifeBuoy, label: t('nav.soporte') },
    { to: '/perfil', icon: UserCircle, label: t('nav.perfil') },
  ]

  const rentadorTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/mis-vehiculos', icon: Car, label: t('nav.misVehiculos') },
    { to: '/mis-reservas', icon: ClipboardList, label: t('nav.misReservas') },
    { to: '/perfil', icon: UserCircle, label: t('nav.perfil') },
  ]

  const tabs = activeRole === 'rentador' ? rentadorTabs : conductorTabs

  return (
    <div className="flex min-h-svh flex-col bg-surface-0">
      <main className="flex-1 pb-28">
        <Outlet />
      </main>
      <BottomNav tabs={tabs} />
    </div>
  )
}
