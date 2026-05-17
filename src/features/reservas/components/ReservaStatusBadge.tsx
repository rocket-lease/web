import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import type { ReservaEstado } from '../types'

const statusMap: Record<ReservaEstado, { className: string; label: string }> = {
  pending_approval: { className: 'bg-brand-500 text-white border-brand-500', label: 'reservas.estado.pending_approval' },
  pending_payment: { className: 'bg-warning text-black border-warning', label: 'reservas.estado.pending_payment' },
  confirmed: { className: 'bg-info text-white border-info', label: 'reservas.estado.confirmed' },
  in_progress: { className: 'bg-success text-white border-success', label: 'reservas.estado.in_progress' },
  completed: { className: 'bg-surface-3 text-text-primary border-white/10', label: 'reservas.estado.completed' },
  cancelled: { className: 'bg-danger text-white border-danger', label: 'reservas.estado.cancelled' },
  rejected: { className: 'bg-danger text-white border-danger', label: 'reservas.estado.rejected' },
  expired: { className: 'bg-surface-3 text-text-primary border-white/10', label: 'reservas.estado.expired' },
}

interface ReservaStatusBadgeProps {
  estado: ReservaEstado
}

export function ReservaStatusBadge({ estado }: ReservaStatusBadgeProps) {
  const { className, label } = statusMap[estado]
  return <Badge className={className}>{t(label as Parameters<typeof t>[0])}</Badge>
}
