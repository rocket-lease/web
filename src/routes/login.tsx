import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage } from '@/features/auth/components/LoginPage'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ hint: z.string().optional(), returnTo: z.string().optional() }),
  component: LoginPage,
})
