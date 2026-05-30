import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { CuponesPage } from '@/features/perfil/components/CuponesPage'

function CuponesRoute() {
  return (
    <AuthGate>
      <CuponesPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/cupones')({
  component: CuponesRoute,
})
