import { createFileRoute } from '@tanstack/react-router'
import { PerfilPage } from '@/features/perfil/components/PerfilPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function PerfilRoute() {
  return <AuthGate><PerfilPage /></AuthGate>
}

export const Route = createFileRoute('/_app/perfil')({
  component: PerfilRoute,
})
