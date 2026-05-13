import { CalendarCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'

export function ReservasConductorPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.title')} />
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
        <CalendarCheck className="h-14 w-14 text-text-muted" />
        <p className="text-text-secondary">{t('reservas.empty')}</p>
        <Link to="/buscar">
          <Button variant="secondary">{t('reservas.emptyAction')}</Button>
        </Link>
      </div>
    </div>
  )
}
