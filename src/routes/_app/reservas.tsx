import { createFileRoute } from '@tanstack/react-router'
import { ReservasConductorPage } from '@/features/reservas/components/ReservasConductorPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function ReservasRoute() {
  return <AuthGate><ReservasConductorPage /></AuthGate>
}

export const Route = createFileRoute('/_app/reservas')({
  component: ReservasRoute,
})
