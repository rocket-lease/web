import { createFileRoute } from '@tanstack/react-router'
import { PagarReservaPage } from '@/features/reservas/components/PagarReservaPage'

export const Route = createFileRoute('/_app/reservas/$id/pago')({
  component: PagarReservaPage,
})
