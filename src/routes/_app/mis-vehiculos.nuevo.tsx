import { createFileRoute } from '@tanstack/react-router'
import { NuevoVehiculoPage } from '@/features/rentador/components/NuevoVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function NuevoVehiculoRoute() {
  return (
    <AuthGate>
      <NuevoVehiculoPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/mis-vehiculos/nuevo')({
  component: NuevoVehiculoRoute,
})
