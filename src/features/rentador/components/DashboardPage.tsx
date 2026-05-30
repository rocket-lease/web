import { TrendUp, Car, CalendarCheck, Star, Plus, Bell, ArrowRight } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { fmt } from '@/lib/formatters'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'

const stats = [
  { label: t('dashboard.ingresos'),            value: fmt.currency(12500000), icon: TrendUp,       color: 'var(--color-success)' },
  { label: t('dashboard.reservasActivas'),     value: '3',                    icon: CalendarCheck,  color: 'var(--color-info)' },
  { label: t('dashboard.vehiculosPublicados'), value: '5',                    icon: Car,            color: 'var(--color-owner)' },
  { label: t('dashboard.calificacion'),        value: '4.8',                  icon: Star,           color: 'var(--color-owner)' },
]

const mockReservas = [
  { id: 'res1', conductor: 'Julián Torres', vehiculo: 'Toyota Corolla', estado: 'confirmed'   as const, fecha: '2026-05-15T10:00:00Z', total: 255000000 },
  { id: 'res2', conductor: 'Sofía García',  vehiculo: 'VW Polo',        estado: 'in_progress' as const, fecha: '2026-05-10T09:00:00Z', total: 124000000 },
]

export function DashboardPage() {
  const { data: profile } = useMyProfile()
  const name = profile?.name?.split(' ')[0] ?? '...'

  return (
    <div className="flex flex-col">
      {/* Header con acento ámbar */}
      <div
        className="px-5 pb-6 bg-gradient-to-b from-[var(--color-owner-subtle)] to-transparent"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-owner">{t('dashboard.greeting')},</p>
            <h1 className="text-2xl font-bold text-text-primary mt-0.5">{name}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/notificaciones"
              aria-label={t('nav.notificaciones')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <Bell size={20} />
            </Link>
            <Link to="/mis-vehiculos/nuevo">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus size={15} weight="bold" />
                {t('dashboard.publicar')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats — flat grid, sin card containers */}
      <div className="px-5 grid grid-cols-2 gap-x-8 gap-y-6">
        {stats.map(stat => (
          <div key={stat.label}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon size={13} weight="fill" color={stat.color} />
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 my-6 h-px bg-white/6" />

      {/* Últimas reservas */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-text-primary">{t('dashboard.ultimasReservas')}</p>
          <Link
            to="/reservas"
            search={{ role: 'owner' }}
            className="flex items-center gap-0.5 text-xs font-medium text-owner"
          >
            {t('general.seeAll')}
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="divide-y divide-white/6">
          {mockReservas.map(r => (
            <Link
              key={r.id}
              to="/reservas/$id"
              params={{ id: r.id }}
              className="flex items-center gap-3 py-3.5 active:opacity-70 transition-opacity"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{r.conductor}</p>
                <p className="text-xs text-text-muted mt-0.5">{r.vehiculo} · {fmt.dateShort(r.fecha)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ReservaStatusBadge estado={r.estado} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
