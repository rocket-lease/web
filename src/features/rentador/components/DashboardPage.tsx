import { CalendarCheck, Car, Star, Plus, Bell, ArrowRight } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { ReservaStatusBadge } from '@/features/reservas/components/ReservaStatusBadge'
import { fmt } from '@/lib/formatters'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'

// Ingresos diarios últimos 7 días (cents)
const weeklyData = [820000, 1450000, 680000, 1920000, 1340000, 2250000, 1040000]
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Estado de la flota: true = ocupado, false = disponible
const fleetStatus = [true, true, true, false, false]

const mockReservas = [
  { id: 'res1', conductor: 'Julián Torres', vehiculo: 'Toyota Corolla', estado: 'confirmed'   as const, fecha: '2026-05-15T10:00:00Z' },
  { id: 'res2', conductor: 'Sofía García',  vehiculo: 'VW Polo',        estado: 'in_progress' as const, fecha: '2026-05-10T09:00:00Z' },
]

function BarChart({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data)
  const BAR_W = 20
  const GAP = 10
  const H = 56
  const W = data.length * (BAR_W + GAP) - GAP

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const barH = Math.max(4, (v / max) * (H - 16))
        const x = i * (BAR_W + GAP)
        const isLast = i === data.length - 1
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - 12 - barH}
              width={BAR_W}
              height={barH}
              rx={4}
              fill={isLast ? 'url(#bar-grad)' : 'rgba(255,255,255,0.08)'}
            />
            <text
              x={x + BAR_W / 2}
              y={H}
              textAnchor="middle"
              fontSize={9}
              fill={isLast ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}
              fontFamily="inherit"
            >
              {days[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function OccupancyRing({ occupied, total }: { occupied: number; total: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const progress = (occupied / total) * circ
  const pct = Math.round((occupied / total) * 100)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width={72} height={72} viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={36} cy={36} r={r}
          fill="none"
          stroke="var(--color-owner)"
          strokeWidth={6}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className="text-base font-bold text-text-primary tabular-nums">{pct}%</span>
        <span className="text-[9px] text-text-muted mt-0.5">ocupación</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: profile } = useMyProfile()
  const name = profile?.name?.split(' ')[0] ?? '...'
  const monthlyRevenue = weeklyData.reduce((a, b) => a + b, 0)
  const fleetOccupied = fleetStatus.filter(Boolean).length

  return (
    <div className="flex flex-col">
      {/* Header con acento ámbar */}
      <div
        className="px-5 pb-5 bg-gradient-to-b from-[var(--color-owner-subtle)] to-transparent"
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
              <Button size="sm">
                <Plus size={15} weight="bold" />
                {t('dashboard.publicar')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Ingresos + bar chart */}
      <div className="px-5 mt-1">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs text-text-muted">{t('dashboard.ingresos')}</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">
            {fmt.currency(monthlyRevenue)}
          </p>
        </div>
        <BarChart data={weeklyData} days={weekDays} />
      </div>

      <div className="mx-5 mt-5 mb-5 h-px bg-white/6" />

      {/* Stats + occupancy ring */}
      <div className="px-5 flex items-center gap-4">
        <OccupancyRing occupied={fleetOccupied} total={fleetStatus.length} />

        <div className="flex-1 grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <CalendarCheck size={12} weight="fill" color="var(--color-info)" />
              <p className="text-[10px] text-text-muted leading-none">Reservas</p>
            </div>
            <p className="text-xl font-bold text-text-primary tabular-nums">3</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Car size={12} weight="fill" color="var(--color-owner)" />
              <p className="text-[10px] text-text-muted leading-none">Vehículos</p>
            </div>
            <p className="text-xl font-bold text-text-primary tabular-nums">5</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} weight="fill" color="var(--color-warning)" />
              <p className="text-[10px] text-text-muted leading-none">Rating</p>
            </div>
            <p className="text-xl font-bold text-text-primary tabular-nums">4.8</p>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-5 mb-5 h-px bg-white/6" />

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
              <ReservaStatusBadge estado={r.estado} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
