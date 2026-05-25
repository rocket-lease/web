import { createFileRoute } from '@tanstack/react-router'
import { ReservarVehiculoPage } from '@/features/reservar/components/ReservarVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { IdentityGate } from '@/features/identity/components/IdentityGate'

export const Route = createFileRoute('/_app/vehiculos/$id_/reservar')({
  component: () => (
    <AuthGate>
      <IdentityGate flow="reserve">
        <ReservarVehiculoPage />
      </IdentityGate>
    </AuthGate>
  ),
})
