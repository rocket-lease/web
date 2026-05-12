import { createFileRoute } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'

function NotificacionesPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Notificaciones" icon={<Bell className="h-5 w-5" />} />
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
          <Bell className="h-8 w-8 text-gray-500" />
        </div>
        <p className="text-base font-medium text-gray-300">Sin notificaciones</p>
        <p className="mt-1 text-sm text-gray-500">Cuando tengas novedades sobre tus reservas apareceran aca.</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/notificaciones')({
  component: NotificacionesPage,
})
