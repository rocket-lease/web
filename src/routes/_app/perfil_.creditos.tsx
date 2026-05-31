import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { CreditsPage } from '@/features/perfil/components/CreditsPage'

function CreditosRoute() {
  return (
    <AuthGate>
      <CreditsPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/creditos')({
  component: CreditosRoute,
})
