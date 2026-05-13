import { createFileRoute, useParams } from '@tanstack/react-router'
import { PerfilPage } from '@/features/perfil/components/PerfilPage'

function PerfilByIdRoute() {
  const { id } = useParams({ from: '/_app/perfil_/$id' })
  return <PerfilPage profileId={id} />
}

export const Route = createFileRoute('/_app/perfil_/$id')({
  component: PerfilByIdRoute,
})
