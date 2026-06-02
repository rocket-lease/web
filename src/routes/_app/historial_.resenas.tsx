import { createFileRoute } from '@tanstack/react-router'
import { ResenasPage } from '@/features/reviews/components/ResenasPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function ResenasRoute() {
  return (
    <AuthGate>
      <ResenasPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/historial_/resenas')({
  component: ResenasRoute,
})
