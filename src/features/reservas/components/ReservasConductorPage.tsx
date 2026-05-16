import { CalendarCheck, Car, Clock, Inbox } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ReservationListItem } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { ReservaStatusBadge } from './ReservaStatusBadge'
import { useMyReservations } from '../hooks/useMyReservations'

/**
 * Devuelve una etiqueta en español con la cantidad de horas que quedan
 * hasta `holdExpiresAt`. Granularidad de horas (redondeo hacia abajo);
 * cuando queda menos de 1h muestra un copy específico, y cuando ya pasó
 * el deadline marca "Solicitud vencida".
 */
export function formatApprovalCountdown(holdExpiresAt: string | null, now = Date.now()): string {
  if (!holdExpiresAt) return ''
  const remainingMs = new Date(holdExpiresAt).getTime() - now
  if (remainingMs <= 0) return t('conductor.reservas.venceVencido')
  const hours = Math.floor(remainingMs / 3_600_000)
  if (hours < 1) return t('conductor.reservas.venceEnMenosDe1Hora')
  return t('conductor.reservas.venceEnHoras').replace('{count}', String(hours))
}

export function ReservasConductorPage() {
  const { data, isLoading } = useMyReservations()
  const items = data?.items ?? []
  const solicitudes = items.filter((r) => r.status === 'pending_approval')
  const resto = items.filter((r) => r.status !== 'pending_approval')

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.title')} />

      {isLoading && (
        <div className="px-4 py-6 space-y-4">
          <div className="h-44 rounded-2xl bg-surface-2 animate-pulse" />
          <div className="h-44 rounded-2xl bg-surface-2 animate-pulse" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <CalendarCheck className="h-14 w-14 text-text-muted" />
          <p className="text-text-secondary">{t('reservas.empty')}</p>
          <Link to="/buscar">
            <Button variant="secondary">{t('reservas.emptyAction')}</Button>
          </Link>
        </div>
      )}

      {!isLoading && solicitudes.length > 0 && (
        <section className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="h-4 w-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-text-primary">
              {t('conductor.reservas.solicitudesEnRevision')} ({solicitudes.length})
            </h2>
          </div>
          <p className="text-xs text-text-muted mb-3">
            {t('conductor.reservas.solicitudesEnRevisionHint')}
          </p>
          <ul className="space-y-4">
            {solicitudes.map((r) => (
              <li key={r.id}>
                <SolicitudCard reserva={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isLoading && resto.length > 0 && (
        <ul className="px-4 py-4 space-y-4">
          {resto.map((r) => (
            <li key={r.id}>
              <ReservaCard reserva={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface ReservaCardProps {
  reserva: ReservationListItem
}

function ReservaCard({ reserva }: ReservaCardProps) {
  return (
    <Link
      to="/reservas/$id"
      params={{ id: reserva.id }}
      className="block overflow-hidden rounded-2xl border border-white/8 bg-surface-1 transition-colors hover:bg-surface-2 active:scale-[0.99]"
    >
      <div className="h-32 bg-surface-2 relative">
        {reserva.vehicle.photo ? (
          <img
            src={reserva.vehicle.photo}
            alt={`${reserva.vehicle.brand} ${reserva.vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Car className="h-12 w-12 text-text-muted" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <ReservaStatusBadge estado={reserva.status} />
        </div>
      </div>
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Reserva #{reserva.id.slice(0, 8)}</p>
            <p className="text-base font-bold text-text-primary truncate">
              {reserva.vehicle.brand} {reserva.vehicle.model} {reserva.vehicle.year}
            </p>
          </div>
          <p className="text-base font-bold text-brand-400 shrink-0">
            {fmt.currency(reserva.totalCents)}
          </p>
        </div>
        <p className="text-xs text-text-muted">
          {fmt.dateTime(reserva.startAt)} → {fmt.dateTime(reserva.endAt)}
        </p>
      </div>
    </Link>
  )
}

function SolicitudCard({ reserva }: ReservaCardProps) {
  const countdown = formatApprovalCountdown(reserva.holdExpiresAt)
  return (
    <Link
      to="/reservas/$id"
      params={{ id: reserva.id }}
      className="block overflow-hidden rounded-2xl border border-brand-500/30 bg-surface-1 transition-colors hover:bg-surface-2 active:scale-[0.99]"
    >
      <div className="h-32 bg-surface-2 relative">
        {reserva.vehicle.photo ? (
          <img
            src={reserva.vehicle.photo}
            alt={`${reserva.vehicle.brand} ${reserva.vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Car className="h-12 w-12 text-text-muted" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <ReservaStatusBadge estado={reserva.status} />
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Reserva #{reserva.id.slice(0, 8)}</p>
            <p className="text-base font-bold text-text-primary truncate">
              {reserva.vehicle.brand} {reserva.vehicle.model} {reserva.vehicle.year}
            </p>
          </div>
          <p className="text-base font-bold text-brand-400 shrink-0">
            {fmt.currency(reserva.totalCents)}
          </p>
        </div>
        <p className="text-xs text-text-muted">
          {fmt.dateTime(reserva.startAt)} → {fmt.dateTime(reserva.endAt)}
        </p>
        {countdown && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-400">
            <Clock className="h-3.5 w-3.5" />
            {countdown}
          </div>
        )}
      </div>
    </Link>
  )
}
