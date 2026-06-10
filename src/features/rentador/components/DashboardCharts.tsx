import { useState } from 'react'
import { t } from '@/i18n/es'

/**
 * Gráficos del dashboard del rentador. Presentacionales (sin llamadas a API):
 * reciben datos ya calculados por props. Colores vía tokens del design system.
 */

/**
 * Curva de ingresos (área suave). Presentacional: recibe los valores ya
 * calculados. Color vía token del design system.
 */
export function LineChart({
  data,
  labels,
}: {
  data: number[]
  labels: string[]
}) {
  const H = 64
  const PAD_TOP = 6
  const PAD_BOTTOM = 14
  const W = 300
  const n = data.length

  if (n === 0) {
    return <div style={{ height: H }} />
  }

  const max = Math.max(1, ...data)
  const innerH = H - PAD_TOP - PAD_BOTTOM
  const stepX = n === 1 ? 0 : W / (n - 1)

  const points = data.map((v, i) => ({
    x: n === 1 ? W / 2 : i * stepX,
    y: PAD_TOP + innerH - (v / max) * innerH,
  }))

  // Path suave con curvas de Bézier (interpolación tipo Catmull-Rom).
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const prev = points[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`
  }, '')

  const areaPath = `${linePath} L ${points[n - 1].x},${
    H - PAD_BOTTOM
  } L ${points[0].x},${H - PAD_BOTTOM} Z`

  // Mostrar como mucho ~6 etiquetas para no saturar.
  const labelStep = Math.max(1, Math.ceil(n / 6))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      style={{ width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id="line-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#line-area-grad)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-success)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={points[n - 1].x}
        cy={points[n - 1].y}
        r={3}
        fill="var(--color-success)"
        vectorEffect="non-scaling-stroke"
      />
      {labels.map((label, i) =>
        i % labelStep === 0 || i === n - 1 ? (
          <text
            key={i}
            x={points[i].x}
            y={H}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            fontSize={9}
            fill="rgba(255,255,255,0.35)"
            fontFamily="inherit"
          >
            {label}
          </text>
        ) : null,
      )}
    </svg>
  )
}

/**
 * Calendario de ocupación del vehículo.
 */
const DAY_MS = 24 * 60 * 60 * 1000

type DayStatus = 'full' | 'partial' | 'free'

/** Fracción [0..1] del día `dayStartMs..+24h` cubierta por los tramos. */
function dayOccupancyFraction(
  dayStartMs: number,
  ranges: { startMs: number; endMs: number }[],
): number {
  const dayEndMs = dayStartMs + DAY_MS
  let covered = 0
  for (const r of ranges) {
    const s = Math.max(dayStartMs, r.startMs)
    const e = Math.min(dayEndMs, r.endMs)
    if (e > s) covered += e - s
  }
  return Math.min(1, covered / DAY_MS)
}

function statusColor(status: DayStatus): string {
  if (status === 'full') return 'bg-success/80 text-surface-0'
  if (status === 'partial') return 'bg-warning/80 text-surface-0'
  return 'bg-danger/25 text-danger' // libre dentro del período
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_LABELS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

type Seg = { startMs: number; endMs: number }

/** Tramos libres dentro del día `dayStartMs..+24h` (complemento de lo ocupado). */
function freeIntervals(
  dayStartMs: number,
  segs: Seg[],
): { start: number; end: number }[] {
  const dayEnd = dayStartMs + DAY_MS
  const occ = segs
    .map((s) => ({ s: Math.max(dayStartMs, s.startMs), e: Math.min(dayEnd, s.endMs) }))
    .filter((x) => x.e > x.s)
    .sort((a, b) => a.s - b.s)
  const free: { start: number; end: number }[] = []
  let cursor = dayStartMs
  for (const o of occ) {
    if (o.s > cursor) free.push({ start: cursor, end: o.s })
    cursor = Math.max(cursor, o.e)
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd })
  return free
}

/** Formatea un instante como HH:MM relativo al inicio del día (24:00 = fin). */
function hhmm(ms: number, dayStartMs: number): string {
  const min = Math.round((ms - dayStartMs) / 60000)
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Calendario de ocupación: una grilla por mes del período, con cada día
 * coloreado — verde = alquilado todo el día, amarillo = parcial, rojo = libre.
 * Tocar un día muestra sus horarios libres.
 */
export function OccupancyCalendar({
  from,
  to,
  ranges,
}: {
  from: string
  to: string
  ranges: { startAt: string; endAt: string }[]
}) {
  const [selectedMs, setSelectedMs] = useState<number | null>(null)
  const fromMs = Date.parse(from)
  const toMs = Date.parse(to)
  const segs: Seg[] = ranges.map((r) => ({
    startMs: Date.parse(r.startAt),
    endMs: Date.parse(r.endAt),
  }))

  // Meses (UTC) tocados por el período.
  const start = new Date(from)
  const months: { year: number; month: number }[] = []
  let y = start.getUTCFullYear()
  let m = start.getUTCMonth()
  const endDate = new Date(to)
  const lastY = endDate.getUTCFullYear()
  const lastM = endDate.getUTCMonth()
  while (y < lastY || (y === lastY && m <= lastM)) {
    months.push({ year: y, month: m })
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }

  const selectedFree = selectedMs !== null ? freeIntervals(selectedMs, segs) : []

  return (
    <div className="space-y-4">
      {months.map(({ year, month }) => {
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
        const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7 // 0=lunes
        const cells: (number | null)[] = [
          ...Array<null>(firstDow).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ]
        return (
          <div key={`${year}-${month}`}>
            <p className="text-xs font-semibold text-text-secondary mb-2">
              {MONTH_LABELS[month]} {year}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((d, i) => (
                <div
                  key={`h${i}`}
                  className="text-center text-[9px] text-text-muted"
                >
                  {d}
                </div>
              ))}
              {cells.map((day, i) => {
                if (day === null) return <div key={`b${i}`} />
                const dayStartMs = Date.UTC(year, month, day)
                const inPeriod =
                  dayStartMs + DAY_MS > fromMs && dayStartMs < toMs
                const frac = dayOccupancyFraction(dayStartMs, segs)
                const status: DayStatus = !inPeriod
                  ? 'free'
                  : frac >= 0.999
                    ? 'full'
                    : frac > 0
                      ? 'partial'
                      : 'free'
                const isSelected = selectedMs === dayStartMs
                return (
                  <button
                    key={`d${i}`}
                    type="button"
                    disabled={!inPeriod}
                    onClick={() => setSelectedMs(dayStartMs)}
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition active:scale-95 ${
                      inPeriod
                        ? statusColor(status)
                        : 'text-text-muted/40 cursor-default'
                    } ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {selectedMs !== null && (
        <div className="rounded-xl bg-surface-2 border border-white/8 p-3">
          <p className="text-xs font-semibold text-text-primary mb-1">
            {new Date(selectedMs).getUTCDate()}{' '}
            {MONTH_LABELS[new Date(selectedMs).getUTCMonth()]}
          </p>
          {selectedFree.length === 0 ? (
            <p className="text-xs text-text-muted">
              {t('dashboard.calendario.ocupadoTodoDia')}
            </p>
          ) : selectedFree.length === 1 &&
            selectedFree[0].start === selectedMs &&
            selectedFree[0].end === selectedMs + DAY_MS ? (
            <p className="text-xs text-success">
              {t('dashboard.calendario.libreTodoDia')}
            </p>
          ) : (
            <p className="text-xs text-text-secondary">
              <span className="text-text-muted">
                {t('dashboard.calendario.libreLabel')}:{' '}
              </span>
              {selectedFree
                .map(
                  (iv) =>
                    `${hhmm(iv.start, selectedMs)}–${hhmm(iv.end, selectedMs)}`,
                )
                .join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function OccupancyRing({
  percent,
  size = 48,
}: {
  percent: number
  size?: number
}) {
  const stroke = 5
  const r = size / 2 - stroke
  const circ = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, percent))
  const progress = (clamped / 100) * circ
  const center = size / 2

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--color-owner)"
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className="text-[11px] font-bold text-text-primary tabular-nums">
        {Math.round(clamped)}%
      </span>
    </div>
  )
}
