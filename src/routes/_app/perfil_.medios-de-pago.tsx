import { createFileRoute } from '@tanstack/react-router'
import { PaymentMethodsPage } from '@/features/payment-methods/components/PaymentMethodsPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function MediosDePagoRoute() {
  return <AuthGate><PaymentMethodsPage /></AuthGate>
}

export const Route = createFileRoute('/_app/perfil_/medios-de-pago')({
  component: MediosDePagoRoute,
})
