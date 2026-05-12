import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import type { ReservaEstado } from '../types'
import type { BadgeProps } from '@/ui/badge'

type Variant = BadgeProps['variant']

const statusMap: Record<ReservaEstado, { variant: Variant; label: string }> = {
  pending_payment: { variant: 'warning', label: 'reservas.estado.pending_payment' },
  confirmed: { variant: 'info', label: 'reservas.estado.confirmed' },
  in_progress: { variant: 'success', label: 'reservas.estado.in_progress' },
  completed: { variant: 'secondary', label: 'reservas.estado.completed' },
  cancelled: { variant: 'danger', label: 'reservas.estado.cancelled' },
  rejected: { variant: 'danger', label: 'reservas.estado.rejected' },
  expired: { variant: 'secondary', label: 'reservas.estado.expired' },
}

interface ReservaStatusBadgeProps {
  estado: ReservaEstado
}

export function ReservaStatusBadge({ estado }: ReservaStatusBadgeProps) {
  const { variant, label } = statusMap[estado]
  return <Badge variant={variant}>{t(label as Parameters<typeof t>[0])}</Badge>
}
