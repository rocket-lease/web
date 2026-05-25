import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { MisCuentasPage } from '@/features/perfil/components/MisCuentasPage'

function CuentasRoute() {
  return (
    <AuthGate>
      <MisCuentasPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/cuentas')({
  component: CuentasRoute,
})
