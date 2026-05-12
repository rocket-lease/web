import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/rentador/components/DashboardPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function DashboardRoute() {
  return <AuthGate><DashboardPage /></AuthGate>
}

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})
