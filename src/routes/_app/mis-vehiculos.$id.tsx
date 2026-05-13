import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { EditarVehiculoPage } from '@/features/rentador/components/EditarVehiculoPage'

function EditarVehiculoRoute() {
  const { id } = Route.useParams()

  return (
    <AuthGate>
      <EditarVehiculoPage vehicleId={id} />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/mis-vehiculos/$id')({
  component: EditarVehiculoRoute,
})