import { createFileRoute } from '@tanstack/react-router'
import { TransferenciaPage } from '@/features/reservas/components/TransferenciaPage'

export const Route = createFileRoute('/_app/reservas-transferencia/$id')({
  component: TransferenciaPage,
})
