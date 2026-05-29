import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarDays, CalendarPlus, Clock } from 'lucide-react'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { Calendar } from '@/ui/calendar'
import { cn } from '@/lib/utils'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { estimateReservationTotalCents } from '@/features/reservar/utils/pricing'
import { useExtendReservation } from '../../hooks/useExtendReservation'

interface ExtendReservationModalProps {
  reservation: GetReservationResponse
  onClose: () => void
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Modal para solicitar la extensión de una reserva en curso.
 *
 * Inputs:
 * - Date picker (Calendar inline) + time picker nativo para el nuevo `endAt`.
 *   Default = `endAt` actual + 1 día.
 *
 * Muestra:
 * - Total estimado client-side con `estimateReservationTotalCents()` usando
 *   el `basePriceCentsSnapshot` actual de la reserva como proxy del precio
 *   diario del vehículo.
 * - Indicador "inmediata" vs "requiere aprobación" según `vehicle.autoAccept`
 *   y el cálculo de `chainTotalDays + extensionDays <= maxDays`.
 *
 * El backend revalida todo y devuelve `requiresApproval` autoritativo en la
 * respuesta — este flag client-side es solo previsualización.
 */
export function ExtendReservationModal({
  reservation,
  onClose,
}: ExtendReservationModalProps) {
  useLockBodyScroll()
  const mutation = useExtendReservation()

  const chainEndAt = getChainTipEndAt(reservation)
  const defaultNewEndAt = new Date(
    new Date(chainEndAt).getTime() + DAY_MS,
  )
  const [date, setDate] = useState(toDateInput(defaultNewEndAt))
  const [time, setTime] = useState(toTimeInput(defaultNewEndAt))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)

  const selectedHour = parseInt(time.split(':')[0], 10)
  const selectedMinute = parseInt(time.split(':')[1], 10)

  const hoursColumnRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!timeOpen) return
    const column = hoursColumnRef.current
    const selected = column?.querySelector<HTMLElement>('[data-selected="true"]')
    if (column && selected) {
      column.scrollTop =
        selected.offsetTop - column.clientHeight / 2 + selected.clientHeight / 2
    }
  }, [timeOpen])

  const vehicleQuery = useQuery({
    queryKey: ['vehicle', reservation.vehicle.id],
    queryFn: () => vehiclesApi.getById(reservation.vehicle.id),
    staleTime: 60_000,
  })

  const newEndAtIso = useMemo(() => combineDateTime(date, time), [date, time])
  const isValid = newEndAtIso !== null && newEndAtIso > chainEndAt

  const dailyPriceCents = reservation.basePriceCentsSnapshot
  const totalCentsPreview = useMemo(() => {
    if (!isValid || !newEndAtIso) return 0
    return estimateReservationTotalCents(
      dailyPriceCents,
      new Date(chainEndAt),
      new Date(newEndAtIso),
    )
  }, [chainEndAt, dailyPriceCents, isValid, newEndAtIso])

  const requiresApproval = computeRequiresApproval({
    reservation,
    vehicleAutoAccept: vehicleQuery.data?.autoAccept ?? null,
    vehicleMaxDays: vehicleQuery.data?.reservationRuleSet?.rentalTimeConstraints?.maxDays,
    newEndAtIso,
  })

  const handleConfirm = async () => {
    if (!isValid || !newEndAtIso) return
    try {
      const result = await mutation.mutateAsync({
        reservationId: reservation.id,
        newEndAt: newEndAtIso,
      })
      toast.success(
        result.requiresApproval
          ? t('reservas.detail.extend.success.solicitud')
          : t('reservas.detail.extend.success.inmediato'),
      )
      onClose()
    } catch {
      toast.error(t('reservas.detail.extend.error.generic'))
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      style={{ minHeight: '100dvh' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-1 border border-white/8 p-6 shadow-elevated my-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-bold text-text-primary">
            {t('reservas.detail.extend.modalTitle')}
          </h2>
        </div>

        <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-muted" />
            <span>
              {t('reservas.detail.extend.currentEndAt')}: {fmt.dateTime(chainEndAt)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {t('reservas.detail.extend.newEndAtLabel')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setCalendarOpen((o) => !o); setTimeOpen(false) }}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-3 disabled:opacity-50"
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{fmtDateLabel(date)}</span>
            </button>
            <button
              type="button"
              onClick={() => { setTimeOpen((o) => !o); setCalendarOpen(false) }}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-3 disabled:opacity-50"
            >
              <Clock className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{fmtTimeLabel(time)}</span>
            </button>
          </div>
          {calendarOpen && (
            <div className="flex justify-center pt-1">
              <Calendar
                mode="single"
                value={date}
                minDate={toDateInput(new Date(new Date(chainEndAt).getTime() + DAY_MS))}
                onChange={(d) => { setDate(d); setCalendarOpen(false) }}
              />
            </div>
          )}
          {timeOpen && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/8 bg-surface-2 p-2">
              <div className="flex flex-col">
                <span className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {t('reservas.detail.extend.hourLabel')}
                </span>
                <div
                  ref={hoursColumnRef}
                  className="relative max-h-40 space-y-1 overflow-y-auto pr-1"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <button
                      key={h}
                      type="button"
                      data-selected={h === selectedHour}
                      onClick={() => setTime(`${String(h).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`)}
                      className={cn(
                        'w-full rounded-lg py-2 text-sm font-medium transition-colors',
                        h === selectedHour
                          ? 'bg-brand-500 text-white'
                          : 'text-text-secondary hover:bg-surface-3',
                      )}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {t('reservas.detail.extend.minuteLabel')}
                </span>
                <div className="space-y-1">
                  {[0, 15, 30, 45].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setTime(`${String(selectedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`); setTimeOpen(false) }}
                      className={cn(
                        'w-full rounded-lg py-2 text-sm font-medium transition-colors',
                        m === selectedMinute
                          ? 'bg-brand-500 text-white'
                          : 'text-text-secondary hover:bg-surface-3',
                      )}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!isValid && (
            <p className="text-xs text-danger-400">
              {t('reservas.detail.extend.error.invalidEndAt')}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-surface-2 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {t('reservas.detail.extend.totalPreview')}
          </span>
          <span className="text-lg font-bold text-brand-400">
            {fmt.currency(totalCentsPreview)}
          </span>
        </div>

        <div
          className={
            requiresApproval
              ? 'rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-text-secondary'
              : 'rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-sm text-text-secondary'
          }
        >
          {vehicleQuery.isLoading
            ? t('reservas.detail.extend.infoLoading')
            : vehicleQuery.isError
              ? t('reservas.detail.extend.infoVehicleError')
              : requiresApproval
                ? t('reservas.detail.extend.infoSolicitud')
                : t('reservas.detail.extend.infoInmediato')}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t('reservas.detail.extend.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending
              ? t('reservas.detail.extend.submitting')
              : requiresApproval
                ? t('reservas.detail.extend.confirmSolicitud')
                : t('reservas.detail.extend.confirmInmediato')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

interface RequiresApprovalArgs {
  reservation: GetReservationResponse
  vehicleAutoAccept: boolean | null
  vehicleMaxDays: number | undefined
  newEndAtIso: string | null
}

/**
 * Calcula client-side si la extensión va a entrar como `pending_approval`
 * o como `pending_payment` (inmediata). El backend revalida — esto es solo
 * previsualización para el conductor.
 *
 * Reglas:
 * - Si `autoAccept` no es `true` → requiere aprobación.
 * - Si el chain (padre + extensiones existentes + extensión nueva en días)
 *   excede `maxDays` del set actual del vehículo → requiere aprobación.
 * - Si no hay `maxDays` definido → solo manda el flag `autoAccept`.
 */
export function computeRequiresApproval(args: RequiresApprovalArgs): boolean {
  const { reservation, vehicleAutoAccept, vehicleMaxDays, newEndAtIso } = args
  if (vehicleAutoAccept !== true) return true
  if (!newEndAtIso) return true
  if (typeof vehicleMaxDays !== 'number') return false

  const chainStart = getChainStartAt(reservation)
  const totalDays = Math.ceil(
    (new Date(newEndAtIso).getTime() - new Date(chainStart).getTime()) /
      DAY_MS,
  )
  return totalDays > vehicleMaxDays
}

/**
 * Devuelve el `startAt` del primer eslabón del chain (el padre). Si no hay
 * chain en la respuesta del backend, asume que la reserva actual es el padre.
 */
function getChainStartAt(reservation: GetReservationResponse): string {
  if (reservation.chain && reservation.chain.length > 0) {
    const sorted = [...reservation.chain].sort((a, b) =>
      a.startAt.localeCompare(b.startAt),
    )
    return sorted[0].startAt
  }
  return reservation.startAt
}

/**
 * Devuelve el `endAt` de la punta del chain (último eslabón no cancelado).
 * Si no hay chain expuesto, usa el `endAt` de la reserva en sí.
 */
function getChainTipEndAt(reservation: GetReservationResponse): string {
  if (reservation.chain && reservation.chain.length > 0) {
    const active = reservation.chain.filter(
      (item) => item.status !== 'cancelled' && item.status !== 'rejected',
    )
    if (active.length === 0) return reservation.endAt
    const sorted = [...active].sort((a, b) => a.endAt.localeCompare(b.endAt))
    return sorted[sorted.length - 1].endAt
  }
  return reservation.endAt
}

const MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDateLabel(ymd: string): string {
  if (!ymd) return '—'
  const [, m, d] = ymd.split('-').map(Number)
  return `${d} de ${MONTH_SHORT[m - 1]}`
}

function fmtTimeLabel(hhmm: string): string {
  if (!hhmm) return '—'
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'a.m.' : 'p.m.'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Convierte un `Date` al formato `YYYY-MM-DD` que espera el Calendar,
 * respetando la zona horaria local del usuario.
 */
function toDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Convierte un `Date` al formato `HH:mm` que espera `<input type="time">`.
 */
function toTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Combina los strings `YYYY-MM-DD` y `HH:mm` en un ISO string en UTC,
 * tomando ambos como hora local del navegador. Devuelve `null` si alguno
 * está vacío o el resultado no es una fecha válida.
 */
function combineDateTime(date: string, time: string): string | null {
  if (!date || !time) return null
  const parsed = new Date(`${date}T${time}`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}
