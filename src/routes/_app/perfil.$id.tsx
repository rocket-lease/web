import { createFileRoute } from '@tanstack/react-router'
import { PerfilPage } from '@/features/perfil/components/PerfilPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function PerfilByIdRoute() {
  const { id } = Route.useParams()
  return (
    <AuthGate>
      <PerfilPage profileId={id} />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil/$id')({
  component: PerfilByIdRoute,
})
