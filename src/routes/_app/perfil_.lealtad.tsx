import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { LealtadPage } from '@/features/perfil/components/LealtadPage'

function LealtadRoute() {
  return (
    <AuthGate>
      <LealtadPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/lealtad')({
  component: LealtadRoute,
})
