import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { ReservaRentadorDetailPage } from '@/features/rentador/components/ReservaRentadorDetailPage'

function RentadorReservaDetailRoute() {
  return (
    <AuthGate>
      <ReservaRentadorDetailPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/rentador/reservas/$id')({
  component: RentadorReservaDetailRoute,
})
