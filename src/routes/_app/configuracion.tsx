import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { ConfiguracionPage } from '@/features/configuracion/components/ConfiguracionPage'

function ConfiguracionRoute() {
  return (
    <AuthGate>
      <ConfiguracionPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/configuracion')({
  component: ConfiguracionRoute,
})
