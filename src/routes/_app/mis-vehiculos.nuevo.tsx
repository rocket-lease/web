import { createFileRoute } from '@tanstack/react-router'
import { NuevoVehiculoPage } from '@/features/rentador/components/NuevoVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { IdentityGate } from '@/features/identity/components/IdentityGate'

function NuevoVehiculoRoute() {
  return (
    <AuthGate>
      <IdentityGate flow="publish">
        <NuevoVehiculoPage />
      </IdentityGate>
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/mis-vehiculos/nuevo')({
  component: NuevoVehiculoRoute,
})
