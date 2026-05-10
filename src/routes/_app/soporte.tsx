import { createFileRoute } from '@tanstack/react-router'
import { SoportePage } from '@/features/soporte/components/SoportePage'

export const Route = createFileRoute('/_app/soporte')({
  component: SoportePage,
})
