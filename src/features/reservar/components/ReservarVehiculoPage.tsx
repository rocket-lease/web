import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type {
  PaymentMethod,
  ProblemDetails,
} from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t, type I18nKey } from '@/i18n/es'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { reservarApi } from '../api/reservar.api'
import { useCreateReservation } from '../hooks/useCreateReservation'
import { useConfirmPayment } from '../hooks/useConfirmPayment'
import { estimateReservationTotalCents } from '../utils/pricing'
import { HoldCountdown } from './HoldCountdown'
import { PaymentMethodPicker } from './PaymentMethodPicker'

type Step = 'fechas' | 'contrato' | 'pago'

interface BusyRange {
  startAt: string
  endAt: string
}

interface DateTimeFieldProps {
  idPrefix: string
  label: string
  value: string
  onChange: (next: string) => void
  busyRanges: BusyRange[]
  minDate?: string
}

function isSlotBusyFor(
  dateStr: string,
  slot: string,
  busyRanges: BusyRange[],
): boolean {
  const slotStart = new Date(`${dateStr}T${slot}`).getTime()
  const slotEnd = slotStart + 30 * 60 * 1000
  return busyRanges.some((r) => {
    const rs = new Date(r.startAt).getTime()
    const re = new Date(r.endAt).getTime()
    return slotStart < re && slotEnd > rs
  })
}

function isSlotInPast(dateStr: string, slot: string, now: Date): boolean {
  return new Date(`${dateStr}T${slot}`).getTime() <= now.getTime()
}

function isDayFullyUnavailable(
  dateStr: string,
  busyRanges: BusyRange[],
  now: Date,
): boolean {
  return HALF_HOUR_SLOTS.every(
    (s) =>
      isSlotBusyFor(dateStr, s, busyRanges) || isSlotInPast(dateStr, s, now),
  )
}

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatYmd(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const WEEKDAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface DateCalendarProps {
  value: string
  onPick: (date: string) => void
  minDate: string
  isDateDisabled: (dateStr: string) => boolean
  onClose: () => void
}

function DateCalendar({
  value,
  onPick,
  minDate,
  isDateDisabled,
  onClose,
}: DateCalendarProps) {
  const initial = value ? new Date(`${value}T00:00:00`) : new Date(`${minDate}T00:00:00`)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [onClose])

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  // Monday-first: dayOfWeek 0=Sunday → 6, 1=Mon → 0
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: Array<{ date: string; day: number } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: formatYmd(new Date(viewYear, viewMonth, d)), day: d })
  }

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1); setViewMonth(11)
    } else setViewMonth(viewMonth - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1); setViewMonth(0)
    } else setViewMonth(viewMonth + 1)
  }

  return (
    <div
      ref={ref}
      className="absolute z-30 mt-2 w-72 rounded-2xl border border-white/8 bg-surface-1 p-3 shadow-elevated"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary capitalize">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="text-center text-[10px] text-text-muted py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />
          const disabled = c.date < minDate || isDateDisabled(c.date)
          const selected = c.date === value
          return (
            <button
              key={c.date}
              type="button"
              disabled={disabled}
              onClick={() => { onPick(c.date); onClose() }}
              className={[
                'h-9 rounded-lg text-sm transition-colors',
                disabled
                  ? 'text-text-muted/40 line-through cursor-not-allowed'
                  : 'text-text-primary hover:bg-surface-2',
                selected && !disabled ? 'bg-brand-500 text-white hover:bg-brand-600' : '',
              ].join(' ')}
            >
              {c.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TimeSelectProps {
  idPrefix: string
  label: string
  value: string
  placeholder: string
  disabled: boolean
  isDisabledSlot: (slot: string) => boolean
  onPick: (slot: string) => void
}

function TimeSelect({
  idPrefix,
  label,
  value,
  placeholder,
  disabled,
  isDisabledSlot,
  onPick,
}: TimeSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={ref} className="relative w-28">
      <button
        id={`${idPrefix}-time`}
        aria-label={label}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl bg-surface-2 border border-white/8 px-3 py-2 text-sm text-text-primary text-left disabled:opacity-50"
      >
        {value && !isDisabledSlot(value) ? value : placeholder}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-28 max-h-44 overflow-y-auto rounded-xl border border-white/8 bg-surface-1 py-1 shadow-elevated">
          {HALF_HOUR_SLOTS.map((slot) => {
            const slotDisabled = isDisabledSlot(slot)
            const selected = slot === value
            return (
              <button
                key={slot}
                type="button"
                disabled={slotDisabled}
                onClick={() => { onPick(slot); setOpen(false) }}
                className={[
                  'w-full px-3 py-1.5 text-sm text-left transition-colors',
                  slotDisabled
                    ? 'text-text-muted/40 cursor-not-allowed'
                    : 'text-text-primary hover:bg-surface-2',
                  selected && !slotDisabled ? 'bg-brand-500/15 text-brand-300' : '',
                ].join(' ')}
              >
                {slot}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DateTimeField({
  idPrefix,
  label,
  value,
  onChange,
  busyRanges,
  minDate,
}: DateTimeFieldProps) {
  const { date, time } = splitLocal(value)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const now = useMemo(() => new Date(), [])

  const isSlotBusy = (slot: string): boolean =>
    !!date && isSlotBusyFor(date, slot, busyRanges)

  const isSlotPast = (slot: string): boolean =>
    !!date && isSlotInPast(date, slot, now)

  const firstFreeSlot =
    HALF_HOUR_SLOTS.find((s) => !isSlotBusy(s) && !isSlotPast(s)) ?? ''
  const effectiveMin = minDate ?? todayStr()

  return (
    <div className="space-y-2">
      <label className="text-sm text-text-secondary" htmlFor={`${idPrefix}-date`}>
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <button
            id={`${idPrefix}-date`}
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-surface-2 border border-white/8 px-3 py-2 text-sm text-text-primary text-left"
          >
            <span className={date ? '' : 'text-text-muted'}>
              {date || 'Elegir fecha'}
            </span>
            <CalendarIcon className="h-4 w-4 text-text-muted shrink-0" />
          </button>
          {calendarOpen && (
            <DateCalendar
              value={date}
              minDate={effectiveMin}
              isDateDisabled={(d) => isDayFullyUnavailable(d, busyRanges, now)}
              onPick={(d) => onChange(joinLocal(d, time || '06:00'))}
              onClose={() => setCalendarOpen(false)}
            />
          )}
        </div>
        <TimeSelect
          idPrefix={idPrefix}
          label={label}
          value={time}
          disabled={!date}
          placeholder={date && firstFreeSlot === '' ? 'sin cupo' : '--:--'}
          isDisabledSlot={(s) => isSlotBusy(s) || isSlotPast(s)}
          onPick={(s) => onChange(joinLocal(date, s))}
        />
      </div>
    </div>
  )
}

function toIsoUtc(local: string): string {
  if (!local) return ''
  const date = new Date(local)
  return date.toISOString()
}

const OPEN_HOUR = 6
const CLOSE_HOUR = 21
const HALF_HOUR_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    if (h < CLOSE_HOUR) slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
})()

function splitLocal(local: string): { date: string; time: string } {
  if (!local || !local.includes('T')) return { date: '', time: '' }
  const [date, time] = local.split('T')
  return { date, time: time.slice(0, 5) }
}

function joinLocal(date: string, time: string): string {
  if (!date || !time) return ''
  return `${date}T${time}`
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code?: unknown }).code === 'string'
  )
}

function errorMessageFor(err: unknown): string {
  if (isProblemDetails(err)) {
    const key = `reservar.errors.${err.code}` as I18nKey
    const message = t(key)
    if (message) return message
  }
  return t('reservar.errors.generic')
}

export function ReservarVehiculoPage() {
  const { id: vehicleId } = useParams({ from: '/_app/vehiculos/$id_/reservar' })
  const navigate = useNavigate()

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesApi.getById(vehicleId),
  })

  const { data: busyData } = useQuery({
    queryKey: ['vehicle', vehicleId, 'busy-ranges'],
    queryFn: () => reservarApi.getBusyRanges(vehicleId),
  })
  const busyRanges = busyData?.items ?? []

  const [step, setStep] = useState<Step>('fechas')
  const [startAtLocal, setStartAtLocal] = useState('')
  const [endAtLocal, setEndAtLocal] = useState('')
  const [contractAccepted, setContractAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [holdExpired, setHoldExpired] = useState(false)

  const createReservation = useCreateReservation()
  const reservationId = createReservation.data?.id ?? null
  const confirmPayment = useConfirmPayment(reservationId)

  const estimatedTotal = useMemo(() => {
    if (!vehicle || !startAtLocal || !endAtLocal) return 0
    const startAt = new Date(startAtLocal)
    const endAt = new Date(endAtLocal)
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return 0
    }
    return estimateReservationTotalCents(vehicle.basePrice, startAt, endAt)
  }, [vehicle, startAtLocal, endAtLocal])

  const validRange =
    !!startAtLocal &&
    !!endAtLocal &&
    new Date(endAtLocal).getTime() > new Date(startAtLocal).getTime()

  const overlapsBusy = useMemo(() => {
    if (!validRange) return false
    const s = new Date(startAtLocal).getTime()
    const e = new Date(endAtLocal).getTime()
    return busyRanges.some((r) => {
      const rs = new Date(r.startAt).getTime()
      const re = new Date(r.endAt).getTime()
      return s < re && e > rs
    })
  }, [validRange, startAtLocal, endAtLocal, busyRanges])

  if (isLoading || !vehicle) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title={t('reservar.title')} showBack />
        <div className="px-4 py-6">
          <div className="h-6 w-1/2 rounded bg-surface-2 animate-pulse" />
        </div>
      </div>
    )
  }

  function goToContrato() {
    if (!validRange) return
    setStep('contrato')
  }

  async function goToPago() {
    if (!contractAccepted) return
    if (reservationId) {
      setStep('pago')
      return
    }
    try {
      await createReservation.mutateAsync({
        vehicleId: vehicle!.id,
        startAt: toIsoUtc(startAtLocal),
        endAt: toIsoUtc(endAtLocal),
        contractAccepted: true,
      })
      setStep('pago')
    } catch {
      // surfaced through createReservation.error
    }
  }

  async function onPay() {
    if (!paymentMethod || !reservationId) return
    try {
      await confirmPayment.mutateAsync({ paymentMethod })
      navigate({
        to: '/reservas/$id',
        params: { id: reservationId },
      })
    } catch {
      // surfaced through confirmPayment.error
    }
  }

  const submissionError =
    confirmPayment.error ?? createReservation.error ?? null

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title={t('reservar.title')} showBack />

      <div className="px-4 py-5 space-y-5">
        <div className="rounded-2xl border border-white/8 bg-surface-1 p-4">
          <p className="text-sm text-text-muted">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {fmt.plate(vehicle.plate)} · {vehicle.city}
          </p>
        </div>

        <ol className="flex items-center gap-2 text-xs">
          {(
            [
              { key: 'fechas', label: t('reservar.step.fechas') },
              { key: 'contrato', label: t('reservar.step.contrato') },
              { key: 'pago', label: t('reservar.step.pago') },
            ] as const
          ).map(({ key, label }, idx) => {
            const active = key === step
            return (
              <li
                key={key}
                className={`flex items-center gap-2 ${
                  active ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                    active
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/15'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{label}</span>
                {idx < 2 && <span className="text-text-muted">/</span>}
              </li>
            )
          })}
        </ol>

        {step === 'fechas' && (
          <div className="space-y-4">
            <DateTimeField
              idPrefix="start-at"
              label={t('reservar.pickupAt')}
              value={startAtLocal}
              onChange={setStartAtLocal}
              busyRanges={busyRanges}
            />
            <DateTimeField
              idPrefix="end-at"
              label={t('reservar.returnAt')}
              value={endAtLocal}
              onChange={setEndAtLocal}
              busyRanges={busyRanges}
              minDate={splitLocal(startAtLocal).date || undefined}
            />
            {startAtLocal && endAtLocal && !validRange && (
              <p className="text-xs text-danger">{t('reservar.invalidRange')}</p>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {t('reservar.total')}
              </span>
              <span className="text-base font-semibold text-text-primary">
                {fmt.price(estimatedTotal)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={!validRange || overlapsBusy}
              onClick={goToContrato}
            >
              {t('reservar.continueToContract')}
            </Button>
          </div>
        )}

        {step === 'contrato' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-surface-1 p-4">
              <h2 className="text-sm font-semibold text-text-primary mb-2">
                {t('reservar.contract.title')}
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('reservar.contract.body')}
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={contractAccepted}
                onChange={(e) => setContractAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 accent-brand-500"
              />
              <span className="text-sm text-text-secondary">
                {t('reservar.contract.accept')}
              </span>
            </label>
            {createReservation.error && (
              <p className="text-sm text-danger">
                {errorMessageFor(createReservation.error)}
              </p>
            )}
            <Button
              size="lg"
              className="w-full"
              disabled={!contractAccepted || createReservation.isPending}
              onClick={goToPago}
            >
              {createReservation.isPending
                ? t('general.loading')
                : t('reservar.continueToPayment')}
            </Button>
          </div>
        )}

        {step === 'pago' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-surface-1 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-text-primary">
                {t('reservar.summary')}
              </h2>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">{t('reservar.pickupAt')}</span>
                <span className="text-text-primary">
                  {fmt.dateTime(startAtLocal)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">{t('reservar.returnAt')}</span>
                <span className="text-text-primary">
                  {fmt.dateTime(endAtLocal)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('reservar.total')}</span>
                <span className="font-semibold text-text-primary">
                  {fmt.price(
                    createReservation.data?.totalCents ?? estimatedTotal,
                  )}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text-primary mb-2">
                {t('reservar.paymentMethod')}
              </p>
              <PaymentMethodPicker
                value={paymentMethod}
                onChange={setPaymentMethod}
                disabled={confirmPayment.isPending || holdExpired}
              />
            </div>

            {createReservation.data?.holdExpiresAt && !holdExpired && (
              <HoldCountdown
                expiresAt={createReservation.data.holdExpiresAt}
                onExpire={() => setHoldExpired(true)}
              />
            )}

            <p className="text-xs text-text-muted">{t('reservar.holdNotice')}</p>

            {submissionError && (
              <p className="text-sm text-danger">
                {errorMessageFor(submissionError)}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={
                !paymentMethod ||
                confirmPayment.isPending ||
                createReservation.isPending ||
                holdExpired
              }
              onClick={onPay}
            >
              {confirmPayment.isPending ? (
                t('general.loading')
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('reservar.payAndConfirm')}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
