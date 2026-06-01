import { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlass, MapPin, NavigationArrow } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ScrollingCalendar } from './ScrollingCalendar'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/**
 * Ciudades sugeridas en el step "¿Dónde?". `value` es el filtro real del
 * backend; `label`/`hint` son presentación. Cuando el step está expandido y
 * no hay query, mostramos solo las primeras `TOP_DESTINATIONS_COUNT`.
 */
const SUGGESTED_DESTINATIONS: ReadonlyArray<{ value: string; label: string; hint: string }> = [
  { value: 'CABA',                    label: 'Buenos Aires',          hint: 'CABA' },
  { value: 'Bariloche',               label: 'Bariloche',             hint: 'Río Negro' },
  { value: 'Mar del Plata',           label: 'Mar del Plata',         hint: 'Buenos Aires' },
  { value: 'Mendoza',                 label: 'Mendoza',               hint: 'Cuyo' },
  { value: 'Córdoba',                 label: 'Córdoba',               hint: 'Centro' },
  { value: 'Salta',                   label: 'Salta',                 hint: 'NOA' },
  { value: 'Rosario',                 label: 'Rosario',               hint: 'Santa Fe' },
  { value: 'San Martín de los Andes', label: 'San Martín de los Andes', hint: 'Neuquén' },
]

const TOP_DESTINATIONS_COUNT = 3

type Step = 'where' | 'when'

export interface SearchOverlayValue {
  city?:  string
  start?: string
  end?:   string
}

interface SearchOverlayProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  initial:      SearchOverlayValue
  onSearch:     (next: SearchOverlayValue) => void
}

const MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${parseInt(d, 10)} ${MONTH_SHORT[parseInt(m, 10) - 1]}`
}

function formatRange(start?: string, end?: string): string | null {
  if (!start && !end) return null
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start ?? end!)
}

/**
 * Overlay de búsqueda primaria con dos cards apilados (Dónde + Cuándo) en
 * acordeón: el activo está expandido, el otro colapsado. El backdrop es
 * blureado pero el espacio entre cards queda transparente para mantener la
 * sensación de capas. Footer global con "Limpiar" + "Buscar".
 */
export function SearchOverlay({ open, onOpenChange, initial, onSearch }: SearchOverlayProps) {
  const [step, setStep] = useState<Step>('where')
  const [whereExpanded, setWhereExpanded] = useState(false)
  const [cityDraft, setCityDraft] = useState<string | undefined>(initial.city)
  const [startDraft, setStartDraft] = useState<string | undefined>(initial.start)
  const [endDraft, setEndDraft] = useState<string | undefined>(initial.end)

  useEffect(() => {
    if (!open) return
    setCityDraft(initial.city)
    setStartDraft(initial.start)
    setEndDraft(initial.end)
    setStep(initial.city ? 'when' : 'where')
    setWhereExpanded(false)
  }, [open, initial.city, initial.start, initial.end])

  const close = () => onOpenChange(false)

  const pickCity = (value: string) => {
    setCityDraft(value)
    setWhereExpanded(false)
    setStep('when')
  }

  const handleNearby = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        pickCity('CABA')
        toast.success('Mostrando opciones en Buenos Aires')
      },
      () => toast.error('No pudimos obtener tu ubicación'),
      { timeout: 8000 },
    )
  }

  const clearAll = () => {
    setCityDraft(undefined)
    setStartDraft(undefined)
    setEndDraft(undefined)
    setStep('where')
  }

  const submit = () => {
    onSearch({ city: cityDraft, start: startDraft, end: endDraft })
    close()
  }

  const cityLabel = SUGGESTED_DESTINATIONS.find(d => d.value === cityDraft)?.label ?? cityDraft
  const datesLabel = formatRange(startDraft, endDraft)

  const phase = useExitPhase(open, 280)
  if (!phase) return null

  return (
    <OverlayShell close={close} state={phase}>
      <OverlayBody
        step={step}
        setStep={setStep}
        whereExpanded={whereExpanded}
        setWhereExpanded={setWhereExpanded}
        cityDraft={cityDraft}
        startDraft={startDraft}
        endDraft={endDraft}
        cityLabel={cityLabel}
        datesLabel={datesLabel}
        pickCity={pickCity}
        onNearby={handleNearby}
        setRange={(r) => { setStartDraft(r.from); setEndDraft(r.to) }}
        clearAll={clearAll}
        submit={submit}
      />
    </OverlayShell>
  )
}

/**
 * Sincroniza el render con un `phase` de entrada/salida. Cuando `open` pasa a
 * `false`, retrasa el unmount `exitMs` ms para que la animación de cierre
 * pueda correr. Devuelve `null` cuando no hay nada para renderizar.
 */
function useExitPhase(open: boolean, exitMs: number): 'opening' | 'open' | 'closing' | null {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing' | null>(open ? 'opening' : null)

  useEffect(() => {
    if (open) {
      setPhase('opening')
      const id = requestAnimationFrame(() => setPhase('open'))
      return () => cancelAnimationFrame(id)
    }
    setPhase(prev => (prev === null ? null : 'closing'))
    const t = setTimeout(() => setPhase(null), exitMs)
    return () => clearTimeout(t)
  }, [open, exitMs])

  return phase
}

/**
 * Wrapper que monta el overlay y bloquea el scroll del body mientras está
 * abierto. `state` distingue las tres fases (opening/open/closing) y las
 * expone via `data-state` para que el CSS dispare las animaciones.
 */
function OverlayShell({
  children, close, state,
}: { children: React.ReactNode; close: () => void; state: 'opening' | 'open' | 'closing' }) {
  useLockBodyScroll()
  return (
    <div data-state={state} className="fixed inset-0 z-[60] flex flex-col group/overlay">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 bg-black/30 backdrop-blur-xl cursor-default opacity-0 transition-opacity duration-200 ease-out group-data-[state=open]/overlay:opacity-100"
      />
      {children}
    </div>
  )
}

interface OverlayBodyProps {
  step:             Step
  setStep:          (s: Step) => void
  whereExpanded:    boolean
  setWhereExpanded: (v: boolean) => void
  cityDraft?:       string
  startDraft?:      string
  endDraft?:        string
  cityLabel?:       string
  datesLabel:       string | null
  pickCity:         (v: string) => void
  onNearby:         () => void
  setRange:         (r: { from?: string; to?: string }) => void
  clearAll:         () => void
  submit:           () => void
}

function OverlayBody({
  step, setStep, whereExpanded, setWhereExpanded,
  cityDraft, startDraft, endDraft, cityLabel, datesLabel,
  pickCity, onNearby, setRange, clearAll, submit,
}: OverlayBodyProps) {
  // En modo expanded el card de Dónde toma toda la pantalla y el de
  // Cuándo se oculta temporalmente para no distraer del search.
  const hideOthers = step === 'where' && whereExpanded

  return (
    <div
      className="relative flex flex-col flex-1 min-h-0 px-3 pb-3 max-w-2xl mx-auto w-full pointer-events-none"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden pointer-events-none">
        <DropSlot grow={step === 'where'}>
          {step === 'where' ? (
            <WhereExpanded
              currentCity={cityDraft}
              onPick={pickCity}
              onNearby={onNearby}
              expanded={whereExpanded}
              onExpand={() => setWhereExpanded(true)}
              onCollapse={() => setWhereExpanded(false)}
            />
          ) : (
            <CardCollapsed
              label="Dónde"
              value={cityLabel ?? 'Cualquier lugar'}
              onClick={() => setStep('where')}
            />
          )}
        </DropSlot>

        {!hideOthers && (
          <DropSlot grow={step === 'when'} delayMs={60}>
            {step === 'when' ? (
              <WhenExpanded
                start={startDraft}
                end={endDraft}
                onChange={setRange}
              />
            ) : (
              <CardCollapsed
                label="Cuándo"
                value={datesLabel ?? 'Agregar fechas'}
                onClick={() => setStep('when')}
              />
            )}
          </DropSlot>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-3 pt-3 shrink-0 pointer-events-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          onClick={clearAll}
          className="pl-3 text-sm font-medium text-white/80 hover:text-white transition-colors active:scale-[0.97]"
        >
          Limpiar todo
        </button>
        <button
          onClick={submit}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-client to-brand-500 px-6 h-11 text-sm font-semibold text-white active:scale-95 transition-transform shadow-lg"
        >
          <MagnifyingGlass size={16} weight="bold" />
          Buscar
        </button>
      </div>
    </div>
  )
}

/**
 * Wrapper que orquesta la entrada/salida de cada card del overlay. La card
 * "cae desde arriba" (translate-y + opacity) sincronizada con el `data-state`
 * del overlay padre. `grow` empuja el slot a `flex-1` cuando el contenido es
 * un card expandido que debe ocupar todo el espacio disponible. `delayMs`
 * permite stagger entre cards consecutivas.
 */
function DropSlot({
  children, grow, delayMs = 0,
}: { children: React.ReactNode; grow: boolean; delayMs?: number }) {
  return (
    <div
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        'min-h-0 flex flex-col opacity-0 -translate-y-3',
        'transition-[transform,opacity] duration-300 ease-[var(--ease-out)]',
        'group-data-[state=open]/overlay:opacity-100 group-data-[state=open]/overlay:translate-y-0',
        grow ? 'flex-1' : 'shrink-0',
      )}
    >
      {children}
    </div>
  )
}

// ─── Card colapsado (pill horizontal) ──────────────────────────────────────

interface CardCollapsedProps {
  label:   string
  value:   string
  onClick: () => void
}

function CardCollapsed({ label, value, onClick }: CardCollapsedProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-2xl bg-surface-1 border border-white/8 px-5 h-14 text-left shadow-lg hover:border-brand-500/40 transition-colors shrink-0 pointer-events-auto"
    >
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary truncate ml-3">{value}</span>
    </button>
  )
}

// ─── Where expandido ───────────────────────────────────────────────────────

interface WhereExpandedProps {
  currentCity?: string
  onPick:       (city: string) => void
  onNearby:     () => void
  expanded:     boolean
  onExpand:     () => void
  onCollapse:   () => void
}

/**
 * Card "Dónde" con dos modos:
 *  - **collapsed** (default): título + search bar inerte + top 3 destinos.
 *    Tocar el search bar dispara `onExpand`.
 *  - **expanded**: card toma toda la altura, search arriba con focus, lista
 *    scrolleable con todos los destinos. Swipe-down desde el handle vuelve
 *    a collapsed.
 */
const COLLAPSE_THRESHOLD_PX = 100

function WhereExpanded({ currentCity, onPick, onNearby, expanded, onExpand, onCollapse }: WhereExpandedProps) {
  const [query, setQuery] = useState('')
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) {
      setQuery('')
      setDragOffset(0)
    }
  }, [expanded])

  const trimmed = query.trim().toLowerCase()
  const matches = trimmed
    ? SUGGESTED_DESTINATIONS.filter(
        d => d.label.toLowerCase().includes(trimmed) || d.hint.toLowerCase().includes(trimmed),
      )
    : expanded
      ? SUGGESTED_DESTINATIONS
      : SUGGESTED_DESTINATIONS.slice(0, TOP_DESTINATIONS_COUNT)

  /**
   * Drag-down desde cualquier parte del card para colapsar. Respeta el
   * scroll de la lista: si el usuario empieza a arrastrar dentro de la
   * lista pero ya hay scroll, dejamos pasar el gesto para que scrollee
   * normalmente. Solo cuando la lista está en top (scrollTop === 0) el
   * drag toma el control del card.
   */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!expanded) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const list = listRef.current
    const targetIsList = list?.contains(e.target as Node) ?? false
    if (targetIsList && list && list.scrollTop > 0) return
    dragStartY.current = e.clientY
    setIsDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return
    const delta = e.clientY - dragStartY.current
    setDragOffset(Math.max(0, delta))
  }

  const onPointerEnd = () => {
    if (dragStartY.current === null) return
    const finalDelta = dragOffset
    dragStartY.current = null
    setIsDragging(false)
    if (finalDelta > COLLAPSE_THRESHOLD_PX) {
      onCollapse()
    } else {
      setDragOffset(0)
    }
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className={cn(
        'bg-surface-1 shadow-2xl flex flex-col will-change-transform pointer-events-auto',
        expanded
          ? 'flex-1 min-h-0 -mx-3 border-x-0 rounded-none touch-none'
          : 'rounded-3xl border border-white/8 shrink-0',
      )}
      style={
        expanded
          ? {
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)',
            }
          : undefined
      }
    >
      <div className={cn('px-5 shrink-0', expanded ? 'pt-5 pb-3' : 'pt-5 pb-3')}>
        <h2 className="text-base font-semibold text-text-primary">Dónde</h2>
      </div>

      <div className="px-5 pb-3 shrink-0">
        {expanded ? (
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar ciudad"
              autoFocus
              className="w-full h-11 rounded-full bg-surface-2 border border-white/8 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onExpand}
            className="w-full h-11 rounded-full bg-surface-2 border border-white/8 px-4 flex items-center gap-2 text-sm text-text-muted hover:border-brand-500/40 transition-colors"
          >
            <MagnifyingGlass size={16} className="text-text-muted shrink-0" />
            <span>Buscar ciudad</span>
          </button>
        )}
      </div>

      <div
        ref={listRef}
        className={cn('px-3 pb-4 space-y-1', expanded ? 'flex-1 min-h-0 overflow-y-auto touch-pan-y' : '')}
      >
        {!trimmed && (
          <DestinationRow
            icon={<NavigationArrow size={18} weight="fill" className="text-brand-400" />}
            label="Cerca mío"
            hint="Buscá lo que hay cerca tuyo"
            onClick={onNearby}
          />
        )}
        {matches.map(d => (
          <DestinationRow
            key={d.value}
            icon={<MapPin size={18} weight="fill" className="text-text-muted" />}
            label={d.label}
            hint={d.hint}
            active={currentCity === d.value}
            onClick={() => onPick(d.value)}
          />
        ))}
        {matches.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">
            No encontramos esa ciudad
          </p>
        )}
      </div>
    </div>
  )
}

interface DestinationRowProps {
  icon:    React.ReactNode
  label:   string
  hint:    string
  active?: boolean
  onClick: () => void
}

function DestinationRow({ icon, label, hint, active, onClick }: DestinationRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        active ? 'bg-brand-500/10' : 'hover:bg-surface-2',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className={cn('text-sm font-medium truncate', active ? 'text-brand-300' : 'text-text-primary')}>
          {label}
        </p>
        <p className="text-xs text-text-muted truncate">{hint}</p>
      </div>
    </button>
  )
}

// ─── When expandido ────────────────────────────────────────────────────────

interface WhenExpandedProps {
  start?:   string
  end?:     string
  onChange: (range: { from?: string; to?: string }) => void
}

function WhenExpanded({ start, end, onChange }: WhenExpandedProps) {
  const datesLabel = useMemo(() => formatRange(start, end) ?? 'Elegí las fechas', [start, end])

  return (
    <div className="flex flex-col rounded-3xl bg-surface-1 border border-white/8 shadow-2xl overflow-hidden flex-1 min-h-0 pointer-events-auto">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h2 className="text-base font-semibold text-text-primary">Cuándo</h2>
        <p className="text-xs text-text-muted mt-1">{datesLabel}</p>
      </div>

      <div className="grid grid-cols-7 gap-y-1 px-4 pb-2 shrink-0 border-b border-white/5">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[11px] text-text-muted py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pt-3 min-h-0">
        <ScrollingCalendar
          value={{ from: start, to: end }}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
