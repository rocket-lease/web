import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ReservasPage } from '@/features/reservas/components/ReservasPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

const reservasSearchSchema = z.object({
  role: z.enum(['conductor', 'owner']).optional(),
})

function ReservasRoute() {
  return (
    <AuthGate>
      <ReservasPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/reservas')({
  component: ReservasRoute,
  validateSearch: reservasSearchSchema,
})
