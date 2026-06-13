import { createFileRoute } from '@tanstack/react-router'
import { AdminPricingPage } from '@/features/admin/components/AdminPricingPage'

export const Route = createFileRoute('/_admin/admin/pricing')({
  component: AdminPricingPage,
})
