import { TrendUp, Car, CalendarCheck, Star, Plus } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { fmt } from '@/lib/formatters'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'

const stats = [
  { label: t('dashboard.ingresos'),           value: fmt.currency(12500000), icon: TrendUp,      color: 'var(--color-success)' },
  { label: t('dashboard.reservasActivas'),    value: '3',                    icon: CalendarCheck, color: 'var(--color-info)' },
  { label: t('dashboard.vehiculosPublicados'), value: '5',                   icon: Car,           color: 'var(--color-owner)' },
  { label: t('dashboard.calificacion'),       value: '4.8',                  icon: Star,          color: 'var(--color-owner)' },
]

export function DashboardPage() {
  const { user } = useAuth()
  const name = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Rentador'

  return (
      <div className="flex flex-col">
        {/* Header con acento ámbar (rol rentador) */}
      <div className="px-4 pt-12 pb-6 bg-gradient-to-b from-[var(--color-owner-subtle)] to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-owner">{t('dashboard.greeting')},</p>
            <h1 className="text-2xl font-bold text-text-primary mt-0.5">{name}</h1>
          </div>
          <Link to="/mis-vehiculos/nuevo">
            <Button size="sm" className="flex items-center gap-1.5">
              <Plus size={15} weight="bold" />
              {t('dashboard.publicar')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(stat => (
            <Card key={stat.label} className="p-4">
              <CardContent className="p-0">
                <div className="mb-3">
                  <stat.icon size={20} weight="fill" color={stat.color} />
                </div>
                <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5 leading-snug">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Recent reservations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t('dashboard.ultimasReservas')}
            </p>
            <Link
              to="/reservas"
              search={{ role: 'owner' }}
              className="text-xs font-medium text-owner"
            >
              {t('general.seeAll')}
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { id: 'res1', conductor: 'Julián Torres', vehiculo: 'Toyota Corolla', estado: 'confirmed' as const, fecha: '2026-05-15T10:00:00Z', total: 255000000 },
              { id: 'res2', conductor: 'Sofía García',  vehiculo: 'VW Polo',        estado: 'in_progress' as const, fecha: '2026-05-10T09:00:00Z', total: 124000000 },
            ].map(r => (
              <div key={r.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-text-primary truncate">{r.conductor}</p>
                    <ReservaStatusBadge estado={r.estado} />
                  </div>
                  <p className="text-sm text-text-muted mt-0.5">{r.vehiculo} · {fmt.dateShort(r.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
