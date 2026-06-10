import { createFileRoute } from '@tanstack/react-router'
import { AdminTicketsPage } from '@/features/admin/components/AdminTicketsPage'

export const Route = createFileRoute('/_admin/tickets')({
  component: AdminTicketsPage,
})
