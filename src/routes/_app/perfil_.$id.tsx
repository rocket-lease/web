import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { PerfilPage } from '@/features/perfil/components/PerfilPage'

function PerfilByIdRoute() {
  const { id } = Route.useParams()

  return (
    <AuthGate>
      <PerfilPage profileId={id} />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/$id')({
  component: PerfilByIdRoute,
})
