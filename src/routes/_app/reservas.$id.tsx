import { createFileRoute } from '@tanstack/react-router'
import { ReservaDetailPage } from '@/features/reservas/components/ReservaDetailPage'

export const Route = createFileRoute('/_app/reservas/$id')({
  component: ReservaDetailPage,
})
