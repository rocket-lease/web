import { createFileRoute } from '@tanstack/react-router'
import { ReservarVehiculoPage } from '@/features/reservar/components/ReservarVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { VerificationGate } from '@/features/verification/components/VerificationGate'

export const Route = createFileRoute('/_app/vehiculos/$id_/reservar')({
  component: () => (
    <AuthGate>
      <VerificationGate flow="reserve">
        <ReservarVehiculoPage />
      </VerificationGate>
    </AuthGate>
  ),
})
