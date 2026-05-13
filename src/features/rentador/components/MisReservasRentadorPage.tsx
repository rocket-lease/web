import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'

export function MisReservasRentadorPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title={t('nav.misReservas')} />
      <div className="flex flex-col items-center justify-center py-24 gap-3 px-6 text-center">
        <ClipboardList className="h-12 w-12 text-text-muted" />
        <p className="text-text-secondary">No hay reservas todavía</p>
      </div>
    </div>
  )
}
