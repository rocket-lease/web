import { useParams } from '@tanstack/react-router'
import { CalendarDays, User, QrCode } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

export function ReservaDetailPage() {
  const { id = '' } = useParams({ strict: false })
  const estado = 'confirmed' as const

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.detail.title')} showBack />

      <div className="px-4 py-5 space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">Reserva #{id.slice(0, 8)}</p>
          <ReservaStatusBadge estado={estado} />
        </div>

        {/* Vehicle */}
        <div className="card overflow-hidden">
          <div className="aspect-video bg-surface-2">
            <img
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600"
              alt="Vehículo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-4">
            <p className="font-bold text-text-primary">Toyota Corolla 2022</p>
            <p className="text-sm text-text-muted mt-0.5">AB 123 CD</p>
          </div>
        </div>

        {/* QR Voucher */}
        {(estado === 'confirmed' || estado === 'in_progress') && (
          <div className="card p-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
              <QrCode className="h-4 w-4" />
              {t('reservas.detail.voucher')}
            </div>
            <div className="h-48 w-48 rounded-2xl bg-surface-2 flex items-center justify-center border border-white/6">
              <QrCode className="h-20 w-20 text-text-muted" />
            </div>
            <p className="text-xs text-text-muted text-center max-w-xs">
              {t('reservas.detail.voucherHelp')}
            </p>
          </div>
        )}

        <Separator />

        {/* Dates */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{t('reservas.detail.dates')}</p>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-surface-2 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-brand-400" />
                <span className="text-xs text-text-muted">{t('reservas.detail.pickup')}</span>
              </div>
              <p className="font-semibold text-text-primary">{fmt.dateShort('2026-05-15T10:00:00Z')}</p>
            </div>
            <div className="flex-1 rounded-xl bg-surface-2 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-brand-400" />
                <span className="text-xs text-text-muted">{t('reservas.detail.return')}</span>
              </div>
              <p className="font-semibold text-text-primary">{fmt.dateShort('2026-05-18T10:00:00Z')}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rentador */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center">
            <User className="h-5 w-5 text-text-muted" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Rentador</p>
            <p className="font-semibold text-text-primary">Lucas M.</p>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-text-primary">{t('reservas.detail.total')}</p>
          <p className="text-xl font-bold text-brand-400">{fmt.currency(255000000)}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button variant="destructive" className="w-full">
            {t('reservas.detail.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
