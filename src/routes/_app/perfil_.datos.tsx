import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { DatosPerfilPage } from '@/features/perfil/components/DatosPerfilPage'

function DatosRoute() {
  return (
    <AuthGate>
      <DatosPerfilPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/datos')({
  component: DatosRoute,
})
