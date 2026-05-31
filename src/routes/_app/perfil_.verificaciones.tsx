import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { VerificacionesPage } from '@/features/perfil/components/VerificacionesPage'

function VerificacionesRoute() {
  return (
    <AuthGate>
      <VerificacionesPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/verificaciones')({
  component: VerificacionesRoute,
})
