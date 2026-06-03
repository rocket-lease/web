import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { MisReportesPage } from '@/features/perfil/components/MisReportesPage'

function ReportesRoute() {
  return (
    <AuthGate>
      <MisReportesPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/perfil_/reportes')({
  component: ReportesRoute,
})
