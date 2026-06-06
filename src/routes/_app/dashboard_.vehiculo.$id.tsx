import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { DashboardVehicleDetailPage } from '@/features/rentador/components/DashboardVehicleDetailPage'

const searchSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'custom']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

function DashboardVehicleDetailRoute() {
  const { id } = Route.useParams()
  const { period, from, to } = Route.useSearch()

  return (
    <AuthGate>
      <DashboardVehicleDetailPage
        vehicleId={id}
        initialPeriod={period}
        initialFrom={from}
        initialTo={to}
      />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/dashboard_/vehiculo/$id')({
  component: DashboardVehicleDetailRoute,
  validateSearch: searchSchema,
})
