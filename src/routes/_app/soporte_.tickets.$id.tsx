import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { TicketDetailPage } from '@/features/soporte/components/TicketDetailPage'

function TicketDetailRoute() {
  const { id } = Route.useParams()
  return (
    <AuthGate>
      <TicketDetailPage ticketId={id} />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/soporte_/tickets/$id')({
  component: TicketDetailRoute,
})
