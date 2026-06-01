import { createFileRoute } from '@tanstack/react-router'
import { HistorialPage } from '@/features/historial/components/HistorialPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function HistorialRoute() {
  return (
    <AuthGate>
      <HistorialPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/historial')({
  component: HistorialRoute,
})
