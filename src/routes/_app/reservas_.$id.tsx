import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { ReservaDetailPage } from '@/features/reservas/components/ReservaDetailPage'

const reservaDetailSearchSchema = z.object({
  role: z.enum(['conductor', 'owner']).optional(),
})

function ReservaDetailRoute() {
  return (
    <AuthGate>
      <ReservaDetailPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/reservas_/$id')({
  component: ReservaDetailRoute,
  validateSearch: reservaDetailSearchSchema,
})

