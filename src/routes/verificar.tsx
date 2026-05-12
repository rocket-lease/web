import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { VerificarPage } from '@/features/auth/components/VerificarPage'

const searchSchema = z.object({
  channel: z.enum(['email', 'phone']).optional(),
})

export const Route = createFileRoute('/verificar')({
  component: VerificarPage,
  validateSearch: (s) => searchSchema.parse(s),
})
