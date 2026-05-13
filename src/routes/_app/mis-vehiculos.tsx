import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { MisVehiculosPage } from '@/features/rentador/components/MisVehiculosPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function MisVehiculosRoute() {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  })

  return <AuthGate>{pathname === '/mis-vehiculos' ? <MisVehiculosPage /> : <Outlet />}</AuthGate>
}

export const Route = createFileRoute('/_app/mis-vehiculos')({
  component: MisVehiculosRoute,
})
