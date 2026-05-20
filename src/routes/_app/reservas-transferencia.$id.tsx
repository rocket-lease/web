import { createFileRoute } from '@tanstack/react-router'
import { TransferenciaPage } from '@/features/reservas/components/TransferenciaPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function TransferenciaRoute() {
  return (
    <AuthGate>
      <TransferenciaPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/reservas-transferencia/$id')({
  component: TransferenciaRoute,
})
