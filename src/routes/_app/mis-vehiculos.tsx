import { createFileRoute } from '@tanstack/react-router'
import { MisVehiculosPage } from '@/features/rentador/components/MisVehiculosPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function MisVehiculosRoute() {
  return <AuthGate><MisVehiculosPage /></AuthGate>
}

export const Route = createFileRoute('/_app/mis-vehiculos')({
  component: MisVehiculosRoute,
})
