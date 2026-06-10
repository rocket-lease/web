import { useState } from 'react'
import { ArrowLeft, TrendUp, XCircle, CalendarCheck } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { DashboardPeriod } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { I18nKey } from '@/i18n/es'
import { DateRangeSheet } from '@/ui/date-range-sheet'
import { useVehicleMetrics } from '../hooks/useVehicleMetrics'
import { LineChart, OccupancyRing, OccupancyCalendar } from './DashboardCharts'

const PERIODS: DashboardPeriod[] = ['week', 'month', 'quarter', 'custom']

function dayStartIso(date: string): string {
  return `${date}T00:00:00.000Z`
}
function dayEndIso(date: string): string {
  return `${date}T23:59:59.999Z`
}

export function DashboardVehicleDetailPage({
  vehicleId,
  initialPeriod,
  initialFrom,
  initialTo,
}: {
  vehicleId: string
  initialPeriod?: DashboardPeriod
  initialFrom?: string
  initialTo?: string
}) {
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod ?? 'month')
  const [customFrom, setCustomFrom] = useState(initialFrom ?? '')
  const [customTo, setCustomTo] = useState(initialTo ?? '')
  const isCustom = period === 'custom'
  const rangeValid = Boolean(customFrom && customTo && customFrom <= customTo)

  const { data, isLoading, isError, refetch } = useVehicleMetrics(
    vehicleId,
    period,
    isCustom && rangeValid ? dayStartIso(customFrom) : undefined,
    isCustom && rangeValid ? dayEndIso(customTo) : undefined,
  )

  const revenueData = data?.revenueByDay.map((p) => p.totalCents) ?? []
  const revenueLabels = data?.revenueByDay.map((p) => p.date.slice(8, 10)) ?? []

  return (
    <div className="flex flex-col">
      <div
        className="px-5 pb-4 bg-gradient-to-b from-[var(--color-owner-subtle)] to-transparent"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            aria-label={t('general.back')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-medium text-owner">
              {t('dashboard.detalle.title')}
            </p>
            <h1 className="text-xl font-bold text-text-primary truncate">
              {data ? `${data.vehicle.brand} ${data.vehicle.model}` : '...'}
            </h1>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-[0.97] ${
                period === p
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              {t(`dashboard.periodo.${p}` as I18nKey)}
            </button>
          ))}
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

      {isError && (
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
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {data && (
        <div className="px-4 space-y-3">
          {/* Ingresos */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendUp size={14} weight="fill" color="var(--color-success)" />
                <p className="text-xs text-text-muted">
                  {t('dashboard.detalle.ingresos')}
                </p>
              </div>
              <p className="text-2xl font-bold text-text-primary tabular-nums leading-none mb-3">
                {fmt.currency(data.vehicle.revenueCents)}
              </p>
              <LineChart data={revenueData} labels={revenueLabels} />
            </CardContent>
          </Card>

          {/* Calendario de ocupación */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-muted">
                  {t('dashboard.detalle.calendario')}
                </p>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[9px] text-text-muted">
                    <span className="h-2 w-2 rounded-sm bg-success/80" />
                    {t('dashboard.calendario.completo')}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-text-muted">
                    <span className="h-2 w-2 rounded-sm bg-warning/80" />
                    {t('dashboard.calendario.parcial')}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-text-muted">
                    <span className="h-2 w-2 rounded-sm bg-danger/25" />
                    {t('dashboard.calendario.libre')}
                  </span>
                </div>
              </div>
              <OccupancyCalendar
                from={data.range.startAt}
                to={data.range.endAt}
                ranges={data.vehicle.occupiedRanges}
              />
            </CardContent>
          </Card>

          {/* Ocupación + cancelaciones */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <CardContent className="p-0 flex flex-col items-center gap-2">
                <OccupancyRing percent={data.vehicle.occupancyRatePercent} size={56} />
                <p className="text-[11px] text-text-muted text-center">
                  {t('dashboard.detalle.ocupacion')}
                </p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardContent className="p-0">
                <XCircle size={18} weight="fill" color="var(--color-danger)" />
                <p className="text-xl font-bold text-text-primary tabular-nums mt-2">
                  {data.cancelledCount}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t('dashboard.detalle.cancelaciones')} ·{' '}
                  {Math.round(data.vehicle.cancellationRatePercent)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reservas */}
          <Card className="p-4">
            <CardContent className="p-0 flex items-center gap-3">
              <CalendarCheck size={18} weight="fill" color="var(--color-info)" />
              <div>
                <p className="text-xl font-bold text-text-primary tabular-nums leading-none">
                  {data.reservationCount}
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  {t('dashboard.detalle.reservas')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
