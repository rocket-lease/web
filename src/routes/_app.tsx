import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  MagnifyingGlass,
  CalendarCheck,
  Car,
  Headset,
  Heart,
  UserCircle,
  ChartBar,
  ClipboardText,
} from '@phosphor-icons/react'
import { BottomNav } from '@/features/layout/components/BottomNav'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { activeRole } = useAuth()

  const conductorTabs = [
    { to: '/buscar',      icon: MagnifyingGlass, label: t('nav.buscar') },
    { to: '/favoritos',   icon: Heart,           label: t('nav.favoritos') },
    { to: '/reservas',    icon: CalendarCheck,   label: t('nav.reservas') },
    { to: '/soporte',     icon: Headset,         label: t('nav.soporte') },
    { to: '/perfil',      icon: UserCircle,      label: t('nav.perfil') },
  ]

  const rentadorTabs = [
    { to: '/dashboard',    icon: ChartBar,        label: t('nav.dashboard') },
    { to: '/mis-vehiculos',icon: Car,             label: t('nav.misVehiculos') },
    { to: '/mis-reservas', icon: ClipboardText,   label: t('nav.misReservas') },
    { to: '/perfil',       icon: UserCircle,      label: t('nav.perfil') },
  ]

  const tabs = activeRole === 'rentador' ? rentadorTabs : conductorTabs
  const role = activeRole === 'rentador' ? 'rentador' : 'conductor'

  return (
    <div className="flex min-h-svh flex-col bg-surface-0">
      {/* App top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-surface-0/90 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
        <img src="/logo-symbol.png" alt="Rocket Lease" className="h-8 w-auto" />
        <span
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{
            background: role === 'rentador'
              ? 'linear-gradient(135deg, #F59E0B 0%, #7C3AED 100%)'
              : 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {role === 'rentador' ? 'Rentando' : 'Conduciendo'}
        </span>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav tabs={tabs} activeRole={role} />
    </div>
  )
}
