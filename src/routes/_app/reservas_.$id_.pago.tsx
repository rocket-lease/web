import { createFileRoute } from '@tanstack/react-router'
import { PagarReservaPage } from '@/features/reservas/components/PagarReservaPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function PagarReservaRoute() {
  return (
    <AuthGate>
      <PagarReservaPage />
    </AuthGate>
  )
}

// `reservas_` y `$id_` (con guión bajo) hacen que esta ruta sea standalone y no
// se anide bajo el listado (`reservas.tsx`) ni el detalle (`reservas_.$id.tsx`),
// que no renderizan <Outlet/>. La URL sigue siendo /reservas/$id/pago.
export const Route = createFileRoute('/_app/reservas_/$id_/pago')({
  component: PagarReservaRoute,
})
