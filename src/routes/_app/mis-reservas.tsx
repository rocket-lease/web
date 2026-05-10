import { createFileRoute } from '@tanstack/react-router'
import { MisReservasRentadorPage } from '@/features/rentador/components/MisReservasRentadorPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function MisReservasRoute() {
  return <AuthGate><MisReservasRentadorPage /></AuthGate>
}

export const Route = createFileRoute('/_app/mis-reservas')({
  component: MisReservasRoute,
})
