import { createFileRoute } from '@tanstack/react-router'
import { PagarReservaPage } from '@/features/reservas/components/PagarReservaPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function PagarReservaRoute() {
  return (
    <AuthGate>
      <PagarReservaPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/reservas/$id/pago')({
  component: PagarReservaRoute,
})
