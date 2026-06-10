import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { DashboardSummaryResponse } from '@rocket-lease/contracts'
import { createWrapper } from '@/test/query-wrapper'
import { DashboardPage } from './DashboardPage'
import * as useDashboardMetricsModule from '../hooks/useDashboardMetrics'
import * as useMyProfileModule from '@/features/perfil/hooks/useMyProfile'

// Link → ancla simple para no necesitar el router en el test.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))
// El diálogo de promoción usa hooks propios; lo stubbeamos.
vi.mock('@/features/promocionar/components/PromocionarDialog', () => ({
  PromocionarDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="promo-dialog" /> : null,
}))
vi.mock('../hooks/useDashboardMetrics')
vi.mock('@/features/perfil/hooks/useMyProfile')
// El selector de rango (bottom sheet con calendario) lo stubbeamos a un botón
// que aplica un rango fijo, para no depender del drawer/calendario en jsdom.
vi.mock('@/ui/date-range-sheet', () => ({
  DateRangeSheet: ({
    onApply,
  }: {
    onApply: (r: { from?: string; to?: string }) => void
  }) => (
    <button onClick={() => onApply({ from: '2026-05-01', to: '2026-05-31' })}>
      aplicar-rango
    </button>
  ),
}))

const lowVehicle = {
  vehicleId: '018f8b3c-4d0e-7000-8000-000000000001',
  brand: 'Toyota',
  model: 'Corolla',
  plate: 'ABC123',
  photoUrl: null,
  occupancyRatePercent: 12,
  occupiedRanges: [],
  revenueCents: 100000,
  reservationCount: 1,
  cancellationRatePercent: 0,
  lowOccupancy: true,
}

const summary: DashboardSummaryResponse = {
  period: 'month',
  range: { startAt: '2026-05-05T00:00:00.000Z', endAt: '2026-06-04T00:00:00.000Z' },
  totalVehicles: 1,
  activeReservations: 3,
  monthlyRevenueCents: 952000000,
  fleetOccupancyRatePercent: 60,
  cancellationRatePercent: 8,
  reputationScore: 4.8,
  revenueByDay: [{ date: '2026-05-05', totalCents: 952000000 }],
  vehicles: [lowVehicle],
  topVehicles: [lowVehicle],
  attentionVehicles: [
    {
      vehicleId: lowVehicle.vehicleId,
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'ABC123',
      upcomingOccupancyRatePercent: 10,
    },
  ],
}

function mockMetrics(over: Partial<ReturnType<typeof useDashboardMetricsModule.useDashboardMetrics>> = {}) {
  vi.mocked(useDashboardMetricsModule.useDashboardMetrics).mockReturnValue({
    data: summary,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...over,
  } as never)
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMyProfileModule.useMyProfile).mockReturnValue({
      data: { name: 'Mariano Test' },
    } as never)
  })

  it('renderiza las métricas clave de la US (ingresos, activas, cancelación, ocupación)', () => {
    mockMetrics()
    render(<DashboardPage />, { wrapper: createWrapper() })

    // Sección General (independiente de la fecha)
    expect(screen.getByText('Activas hoy')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/Calificacion promedio/)).toBeInTheDocument()
    // Sección por período
    expect(screen.getByText('Tasa de cancelacion')).toBeInTheDocument()
    expect(screen.getByText('8%')).toBeInTheDocument()
    expect(screen.getByText('Ocupacion de flota')).toBeInTheDocument()
    expect(screen.getByText('Mas rentados')).toBeInTheDocument()
  })

  it('resalta vehículo con baja ocupación y muestra Promover / Ajustar precio', () => {
    mockMetrics()
    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Baja ocupacion', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Promover' })).toBeInTheDocument()
    expect(screen.getByText('Ajustar precio')).toBeInTheDocument()
  })

  it('abre el diálogo de promoción al tocar Promover', () => {
    mockMetrics()
    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.queryByTestId('promo-dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Promover' }))
    expect(screen.getByTestId('promo-dialog')).toBeInTheDocument()
  })

  it('cambiar de período vuelve a pedir las métricas con el nuevo valor', () => {
    mockMetrics()
    render(<DashboardPage />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByRole('button', { name: 'Trimestre' }))

    const calls = vi.mocked(useDashboardMetricsModule.useDashboardMetrics).mock.calls
    expect(calls.some(([p]) => p === 'quarter')).toBe(true)
  })

  it('al elegir Personalizado muestra el selector de rango y consulta el rango custom', () => {
    mockMetrics()
    render(<DashboardPage />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByRole('button', { name: 'Personalizado' }))

    // Aparece el selector de rango (sheet) reutilizado de reservas.
    const applyBtn = screen.getByRole('button', { name: 'aplicar-rango' })
    fireEvent.click(applyBtn)

    const calls = vi.mocked(useDashboardMetricsModule.useDashboardMetrics).mock.calls
    const customCall = calls.find(
      ([p, from, to]) =>
        p === 'custom' &&
        from === '2026-05-01T00:00:00.000Z' &&
        to === '2026-05-31T23:59:59.999Z',
    )
    expect(customCall).toBeDefined()
  })

  it('muestra el estado de error con reintento', () => {
    mockMetrics({ data: undefined, isError: true } as never)
    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(
      screen.getByText('No pudimos cargar las metricas. Intenta de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('muestra empty state cuando no hay vehículos', () => {
    mockMetrics({
      data: { ...summary, vehicles: [], topVehicles: [] },
    } as never)
    render(<DashboardPage />, { wrapper: createWrapper() })

    const heading = screen.getByText('Ocupacion por vehiculo').closest('div')!
    expect(
      within(heading).getByText('Todavia no publicaste ningun vehiculo'),
    ).toBeInTheDocument()
  })
})
