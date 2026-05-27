import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { VehicleDocumentsPage } from '@/features/vehiculos/components/VehicleDocumentsPage'

function VehicleDocumentsRoute() {
  const { id } = Route.useParams()

  return (
    <AuthGate>
      <VehicleDocumentsPage vehicleId={id} />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/mis-vehiculos/$id_/documentos')({
  component: VehicleDocumentsRoute,
})
