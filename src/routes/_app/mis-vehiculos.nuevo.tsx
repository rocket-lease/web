import { createFileRoute } from '@tanstack/react-router'
import { NuevoVehiculoPage } from '@/features/rentador/components/NuevoVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { VerificationGate } from '@/features/verification/components/VerificationGate'

function NuevoVehiculoRoute() {
  return (
    <AuthGate>
      <VerificationGate flow="publish">
        <NuevoVehiculoPage />
      </VerificationGate>
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/mis-vehiculos/nuevo')({
  component: NuevoVehiculoRoute,
})
