import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bug, X } from 'lucide-react'
import {
  GeoLocationsResponseSchema,
  type AdminPricingZone,
} from '@rocket-lease/contracts'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { adminPricingApi } from '../api/admin-pricing.api'

/** Flag de build: el panel solo existe en entornos locales con el flag puesto. */
export const PRICING_DEBUG_ENABLED =
  import.meta.env.VITE_PRICING_DEBUG === 'true'

interface PricingDebugPanelProps {
  selectedZone: AdminPricingZone | null
  onChanged: () => void
}

function useCabaBarrios() {
  return useQuery({
    queryKey: ['geo', 'locations', 'caba-children'],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>('/geo/locations')
      const parsed = GeoLocationsResponseSchema.parse(raw)
      return parsed.locations.find((l) => l.code === 'caba')?.children ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Panel de debug del heatmap: inyecta demanda en una celda o barrio y dispara
 * una cotización real para ver el mapa reaccionar sin generar tráfico a mano.
 * Toda la data queda firmada por el usuario debug y se borra con "Limpiar".
 */
export function PricingDebugPanel({
  selectedZone,
  onChanged,
}: PricingDebugPanelProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'cell' | 'barrio'>('barrio')
  const [barrio, setBarrio] = useState('caba-belgrano')
  const [count, setCount] = useState(10)
  const barrios = useCabaBarrios()
  const containerRef = useRef<HTMLDivElement>(null)

  // El mapa (gestureHandling greedy) captura el pointerdown del overlay y se
  // queda con el gesto, así que los clicks nunca llegan a los botones. Frenamos
  // pointer/mouse/touch-down en el panel para que no escalen al mapa; el click
  // no se toca, así el handler del botón sigue disparando.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const stop = (event: Event) => event.stopPropagation()
    el.addEventListener('pointerdown', stop)
    el.addEventListener('mousedown', stop)
    el.addEventListener('touchstart', stop)
    return () => {
      el.removeEventListener('pointerdown', stop)
      el.removeEventListener('mousedown', stop)
      el.removeEventListener('touchstart', stop)
    }
  }, [open])

  const selectedH3Cell = selectedZone?.h3Cell ?? null
  const barrioName =
    barrios.data?.find((b) => b.code === barrio)?.name ?? 'Elegí un barrio'

  const emit = useMutation({
    mutationFn: (action: 'add' | 'remove') =>
      adminPricingApi.emitDebugSignals(
        mode === 'cell'
          ? { h3Cell: selectedH3Cell!, signal: 'search', count, mode: action }
          : { locationCode: barrio, signal: 'search', count, mode: action },
      ),
    onSuccess: (res) => {
      toast.success(
        `${res.affected} señales ${res.mode === 'remove' ? 'quitadas' : 'emitidas'}`,
      )
      onChanged()
    },
    onError: () => toast.error('No se pudo modificar la demanda'),
  })

  const clear = useMutation({
    mutationFn: () => adminPricingApi.clearDebugData(),
    onSuccess: () => {
      toast.success('Data debug borrada')
      onChanged()
    },
    onError: () => toast.error('No se pudo limpiar la data debug'),
  })

  const busy = emit.isPending || clear.isPending
  const cellDisabled = mode === 'cell' && !selectedH3Cell

  if (!open) {
    return (
      <div ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-1/90 px-3 py-1.5 text-xs font-medium text-text-secondary backdrop-blur transition-colors hover:text-text-primary"
        >
          <Bug className="h-3.5 w-3.5" />
          Debug
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
    <div className="absolute right-4 top-4 z-10 flex w-72 flex-col gap-4 rounded-2xl border border-white/10 bg-surface-1/95 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <Bug className="h-3.5 w-3.5" />
          Emitir demanda
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex rounded-xl bg-surface-2 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode('barrio')}
          className={`flex-1 rounded-lg px-2 py-1.5 transition-colors ${mode === 'barrio' ? 'bg-surface-0 text-text-primary' : 'text-text-muted'}`}
        >
          Barrio
        </button>
        <button
          type="button"
          onClick={() => setMode('cell')}
          className={`flex-1 rounded-lg px-2 py-1.5 transition-colors ${mode === 'cell' ? 'bg-surface-0 text-text-primary' : 'text-text-muted'}`}
        >
          Hexágono
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-text-muted">Zona</span>
        {mode === 'barrio' ? (
          <Select value={barrio} onValueChange={setBarrio}>
            <SelectTrigger>
              <SelectValue>{barrioName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {barrios.data?.map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : selectedZone ? (
          <div className="rounded-xl border border-white/8 bg-surface-2 px-4 py-2.5 text-sm text-text-primary">
            Hexágono del mapa
            <span className="mt-0.5 block text-xs text-text-muted">
              oferta {selectedZone.supplyCount} · ×
              {selectedZone.avgMultiplier.toFixed(2)}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-surface-2 px-4 py-2.5 text-xs text-text-muted">
            Tocá un hexágono en el mapa
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-text-muted">Cantidad de búsquedas</span>
        <Input
          type="number"
          min={1}
          max={500}
          value={count}
          onChange={(e) =>
            setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
          }
          className="h-10"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={busy || cellDisabled}
          onClick={() => emit.mutate('add')}
        >
          Emitir
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          disabled={busy || cellDisabled}
          onClick={() => emit.mutate('remove')}
        >
          Quitar
        </Button>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => clear.mutate()}
        className="text-xs text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
      >
        Limpiar todo
      </button>
    </div>
    </div>
  )
}
