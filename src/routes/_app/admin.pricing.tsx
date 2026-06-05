import { createFileRoute } from '@tanstack/react-router'
import { AdminGate } from '@/features/admin/components/AdminGate'
import { AdminPricingPage } from '@/features/admin/components/AdminPricingPage'

function AdminPricingRoute() {
  return (
    <AdminGate>
      <AdminPricingPage />
    </AdminGate>
  )
}

export const Route = createFileRoute('/_app/admin/pricing')({
  component: AdminPricingRoute,
})
