import { createFileRoute } from '@tanstack/react-router'
import { RecoverPage } from '@/features/auth/components/RecoverPage'

export const Route = createFileRoute('/recuperar')({
  component: RecoverPage,
})
