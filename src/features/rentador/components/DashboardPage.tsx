import { useState } from 'react'
import {
  TrendUp,
  CalendarCheck,
  Star,
  Plus,
  Bell,
  ArrowRight,
  Percent,
  Warning,
  Trophy,
  CaretRight,
  Car,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type {
  DashboardAttentionVehicle,
  DashboardPeriod,
  DashboardVehicleMetric,
} from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { fmt } from '@/lib/formatters'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'
import type { I18nKey } from '@/i18n/es'
import { PromocionarDialog } from '@/features/promocionar/components/PromocionarDialog'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { LineChart, OccupancyRing } from './DashboardCharts'

const PERIODS: DashboardPeriod[] = ['week', 'month', 'quarter', 'custom']

/** Suma de días alquilados a partir de los tramos ocupados. */
function occupiedDaysOf(ranges: { startAt: string; endAt: string }[]): number {
  const ms = ranges.reduce(
    (sum, r) => sum + Math.max(0, Date.parse(r.endAt) - Date.parse(r.startAt)),
    0,
  )
  return ms / 86_400_000
}

/** `YYYY-MM-DD` (input date) → ISO al inicio/fin del día en UTC. */
function dayStartIso(date: string): string {
  return `${date}T00:00:00.000Z`
}
function dayEndIso(date: string): string {
  return `${date}T23:59:59.999Z`
}

function PeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod
  onChange: (p: DashboardPeriod) => void
}) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-[0.97] ${
            value === p
              ? 'bg-brand-500 text-white'
              : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          {t(`dashboard.periodo.${p}` as I18nKey)}
        </button>
      ))}
    </div>
  )
}


function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="mb-2">{icon}</div>
        <p className="text-xl font-bold text-text-primary tabular-nums">
          {value}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
          {label}
        </p>
      </CardContent>
    </Card>
  )
}

type DetailSearch = { period: DashboardPeriod; from?: string; to?: string }

function VehicleRow({
  vehicle,
  search,
}: {
  vehicle: DashboardVehicleMetric
  search: DetailSearch
}) {
  return (
    <Link
      to="/dashboard/vehiculo/$id"
      params={{ id: vehicle.vehicleId }}
      search={search}
      className="flex items-center gap-3 py-3 active:opacity-70 transition-opacity"
    >
      <OccupancyRing percent={vehicle.occupancyRatePercent} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-xs text-text-muted mt-0.5 truncate">
          {fmt.currency(vehicle.revenueCents)} · {vehicle.reservationCount}{' '}
          {t('dashboard.reservasEnPeriodo')}
        </p>
      </div>
      <CaretRight size={16} className="text-text-muted shrink-0" />
    </Link>
  )
}

function LowOccupancyCard({
  vehicle,
  onPromote,
}: {
  vehicle: DashboardAttentionVehicle
  onPromote: (vehicleId: string) => void
}) {
  return (
    <Card className="p-4 border border-owner/30 bg-owner-subtle">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start gap-3">
          <Warning size={20} weight="duotone" className="text-owner shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-owner truncate">
                {vehicle.brand} {vehicle.model}
              </p>
              <span className="text-[10px] font-semibold text-owner bg-owner/15 px-2 py-0.5 rounded-full shrink-0">
                {Math.round(vehicle.upcomingOccupancyRatePercent)}% ·{' '}
                {t('dashboard.bajaOcupacion')}
              </span>
            </div>
            <p className="text-xs text-owner/80 mt-1">
              {t('dashboard.bajaOcupacionHint')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPromote(vehicle.vehicleId)}
          >
            {t('dashboard.promover')}
          </Button>
          <Link to="/mis-vehiculos/$id" params={{ id: vehicle.vehicleId }}>
            <Button size="sm" variant="secondary">
              {t('dashboard.ajustarPrecio')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: profile } = useMyProfile()
  const name = profile?.name?.split(' ')[0] ?? '...'

  const [period, setPeriod] = useState<DashboardPeriod>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const isCustom = period === 'custom'
  const rangeValid = Boolean(customFrom && customTo && customFrom <= customTo)

  const { data, isLoading, isError, refetch } = useDashboardMetrics(
    period,
    isCustom && rangeValid ? dayStartIso(customFrom) : undefined,
    isCustom && rangeValid ? dayEndIso(customTo) : undefined,
  )
  const [promoteVehicleId, setPromoteVehicleId] = useState<string | null>(null)

  const attentionVehicles = data?.attentionVehicles ?? []

  // Período a propagar al detalle del vehículo (mantiene la selección).
  const detailSearch: DetailSearch =
    isCustom && rangeValid
      ? { period, from: customFrom, to: customTo }
      : { period }

  const revenueData = data?.revenueByDay.map((p) => p.totalCents) ?? []
  const revenueLabels =
    data?.revenueByDay.map((p) => p.date.slice(8, 10)) ?? []

  return (
    <div className="flex flex-col">
      {/* Header con acento ámbar */}
      <div
        className="px-5 pb-5 bg-gradient-to-b from-[var(--color-owner-subtle)] to-transparent"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-owner">
              {t('dashboard.greeting')},
            </p>
            <h1 className="text-2xl font-bold text-text-primary mt-0.5">
              {name}
            </h1>
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

      {/* General — métricas independientes de la fecha */}
      {data && (
        <div className="px-4 -mt-2">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              icon={
                <Star size={16} weight="fill" color="var(--color-warning)" />
              }
              value={fmt.rating(data.reputationScore)}
              label={t('dashboard.calificacion')}
            />
            <MetricCard
              icon={
                <CalendarCheck
                  size={16}
                  weight="fill"
                  color="var(--color-info)"
                />
              }
              value={String(data.activeReservations)}
              label={t('dashboard.activasHoy')}
            />
            <MetricCard
              icon={<Car size={16} weight="fill" color="var(--color-owner)" />}
              value={String(data.totalVehicles)}
              label={t('dashboard.vehiculos')}
            />
          </div>

          {/* Alerta de baja ocupación próxima (independiente del período) */}
          {attentionVehicles.length > 0 && (
            <div className="mt-3 space-y-3">
              {attentionVehicles.map((v) => (
                <LowOccupancyCard
                  key={v.vehicleId}
                  vehicle={v}
                  onPromote={setPromoteVehicleId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Período — selector + métricas del rango */}
      <div className="px-4 mt-5 mb-1">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        {isCustom && (
          <div className="mt-3">
            <DateRangeSheet
              value={{ from: customFrom || undefined, to: customTo || undefined }}
              onApply={(range) => {
                setCustomFrom(range.from ?? '')
                setCustomTo(range.to ?? '')
              }}
              placeholder={t('dashboard.custom.placeholder')}
              title={t('dashboard.custom.title')}
            />
          </div>
        )}
      </div>

      {isError && !data && (
        <div className="px-4">
          <Card className="p-4">
            <CardContent className="p-0 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-text-secondary">
                {t('dashboard.error')}
              </p>
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                {t('general.retry')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="px-4 space-y-3">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="px-4 space-y-3">
            {/* Ingresos — card ancha con bar chart */}
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendUp
                        size={14}
                        weight="fill"
                        color="var(--color-success)"
                      />
                      <p className="text-xs text-text-muted">
                        {t(`dashboard.ingresos.${period}` as I18nKey)}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">
                      {fmt.currency(data.monthlyRevenueCents)}
                    </p>
                  </div>
                </div>
                <LineChart data={revenueData} labels={revenueLabels} />
              </CardContent>
            </Card>

            {/* Métricas del período */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <CardContent className="p-0 flex items-center gap-3">
                  <OccupancyRing percent={data.fleetOccupancyRatePercent} />
                  <p className="text-[11px] text-text-muted leading-snug">
                    {t('dashboard.ocupacion')}
                  </p>
                </CardContent>
              </Card>
              <MetricCard
                icon={
                  <Percent size={16} weight="fill" color="var(--color-danger)" />
                }
                value={`${Math.round(data.cancellationRatePercent)}%`}
                label={t('dashboard.tasaCancelacion')}
              />
            </div>
          </div>

          {/* Ocupación por vehículo */}
          <div className="mx-5 my-5 h-px bg-white/6" />
          <div className="px-5">
            <p className="text-sm font-semibold text-text-primary mb-1">
              {t('dashboard.ocupacionPorVehiculo')}
            </p>
            {data.vehicles.length === 0 ? (
              <EmptyFleet />
            ) : (
              <div className="divide-y divide-white/6">
                {data.vehicles.map((v) => (
                  <VehicleRow
                    key={v.vehicleId}
                    vehicle={v}
                    search={detailSearch}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Más rentados */}
          {data.topVehicles.length > 0 && (
            <>
              <div className="mx-5 my-5 h-px bg-white/6" />
              <div className="px-5 pb-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy size={15} weight="fill" className="text-owner" />
                  <p className="text-sm font-semibold text-text-primary">
                    {t('dashboard.masRentados')}
                  </p>
                </div>
                <div className="divide-y divide-white/6">
                  {data.topVehicles.map((v, i) => (
                    <Link
                      key={v.vehicleId}
                      to="/dashboard/vehiculo/$id"
                      params={{ id: v.vehicleId }}
                      search={detailSearch}
                      className="flex items-center gap-3 py-3 active:opacity-70 transition-opacity"
                    >
                      <span className="text-sm font-bold text-owner w-5 text-center tabular-nums">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {Math.round(occupiedDaysOf(v.occupiedRanges))}{' '}
                          {t('dashboard.dias')} · {fmt.currency(v.revenueCents)}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-text-muted shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <PromocionarDialog
        open={promoteVehicleId !== null}
        onOpenChange={(open) => {
          if (!open) setPromoteVehicleId(null)
        }}
        vehicleId={promoteVehicleId ?? ''}
      />
    </div>
  )
}

function EmptyFleet() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm font-medium text-text-secondary">
        {t('dashboard.sinVehiculos')}
      </p>
      <p className="text-xs text-text-muted max-w-[240px]">
        {t('dashboard.sinVehiculosCta')}
      </p>
      <Link to="/mis-vehiculos/nuevo">
        <Button size="sm">
          <Plus size={15} weight="bold" />
          {t('dashboard.publicar')}
        </Button>
      </Link>
    </div>
  )
}
