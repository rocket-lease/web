import { createFileRoute } from '@tanstack/react-router'
import { AdminTicketDetailPage } from '@/features/admin/components/AdminTicketDetailPage'

export const Route = createFileRoute('/_admin/tickets_/$id')({
  component: function AdminTicketDetailRoute() {
    const { id } = Route.useParams()
    return <AdminTicketDetailPage ticketId={id} />
  },
})
