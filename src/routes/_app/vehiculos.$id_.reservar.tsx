import { createFileRoute } from '@tanstack/react-router'
import { ReservarVehiculoPage } from '@/features/reservar/components/ReservarVehiculoPage'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { VerificationGate } from '@/features/verification/components/VerificationGate'

interface ReservarSearch {
  start?: string
  end?: string
}

export const Route = createFileRoute('/_app/vehiculos/$id_/reservar')({
  validateSearch: (search: Record<string, unknown>): ReservarSearch => ({
    start: typeof search.start === 'string' ? search.start : undefined,
    end: typeof search.end === 'string' ? search.end : undefined,
  }),
  component: () => (
    <AuthGate>
      <VerificationGate flow="reserve">
        <ReservarVehiculoPage />
      </VerificationGate>
    </AuthGate>
  ),
})
