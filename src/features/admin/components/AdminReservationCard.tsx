import { Link } from '@tanstack/react-router'
import { Car, ArrowRight } from '@phosphor-icons/react'
import { t } from '@/i18n/es'

interface AdminReservationCardProps {
  reservationId: string
}

export function AdminReservationCard({ reservationId }: AdminReservationCardProps) {
  return (
    <Link
      to="/reservas/$id"
      params={{ id: reservationId }}
      className="flex items-center gap-3 rounded-xl bg-surface-1 border border-white/6 px-4 py-3 transition-colors active:bg-surface-2"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15">
        <Car size={18} weight="duotone" className="text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {t('admin.tickets.reservaAsociada')}
        </p>
        <p className="text-xs text-text-muted font-mono mt-0.5">#{reservationId.slice(0, 8)}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-text-muted" />
    </Link>
  )
}
