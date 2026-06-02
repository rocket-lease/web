import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PagarReservaPage } from '../PagarReservaPage'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/reservar/api/reservar.api', () => ({
  reservarApi: {
    getById: vi.fn(),
    confirmPayment: vi.fn(),
    initiateTransfer: vi.fn(),
    payBalance: vi.fn(),
    initiateBalanceTransfer: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: 'res-1' }),
  useNavigate: () => vi.fn(),
  useRouter: () => ({ history: { back: vi.fn() } }),
  Link: ({ children, ...rest }: { children: React.ReactNode; [k: string]: unknown }) => (
    <a {...rest}>{children}</a>
  ),
}))

const getById = vi.mocked(reservarApi.getById)

function makeReservation(overrides: Partial<Awaited<ReturnType<typeof reservarApi.getById>>> = {}) {
  return {
    id: 'res-1',
    vehicleId: 'veh-1',
    conductorId: 'con-1',
    rentadorId: 'ren-1',
    status: 'pending_payment' as const,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS' as const,
    paymentMethod: null,
    walletProvider: null,
    contractAcceptedAt: '2026-05-16T10:00:00.000Z',
    paidAt: null,
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    rejectionReason: null,
    depositPercentageSnapshot: null,
    pricingSnapshot: {
      vehicleId: 'veh-1',
      currency: 'ARS' as const,
      basePriceCents: 50000,
      durationDays: 2,
      subtotalCents: 100000,
      appliedDiscountTier: null,
      appliedDiscountPercentage: 0,
      discountCents: 0,
      totalCents: 100000,
    },
    basePriceCentsSnapshot: 50000,
    cancellationPolicySnapshot: 'FLEXIBLE' as const,
    maxKilometrageSnapshot: { type: 'UNLIMITED' as const },
    rentalTimeConstraintsSnapshot: {},
    createdAt: '2026-05-16T10:00:00.000Z',
    updatedAt: '2026-05-16T10:00:00.000Z',
    vehicle: { id: 'veh-1', brand: 'Toyota', model: 'Etios', year: 2020, photo: null },
    rentador: { id: 'ren-1', name: 'Lucas', avatarUrl: null },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PagarReservaPage — breakdown de seña (US-49)', () => {
  it('NO muestra el breakdown cuando depositPercentageSnapshot es null', async () => {
    getById.mockResolvedValue(makeReservation({ depositPercentageSnapshot: null }))
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(getById).toHaveBeenCalled())
    expect(screen.queryByTestId('payment-breakdown')).not.toBeInTheDocument()
  })

  it('muestra el aviso de seña cuando depositPercentageSnapshot=30', async () => {
    getById.mockResolvedValue(
      makeReservation({
        depositPercentageSnapshot: 30,
        totalCents: 100000,
      }),
    )
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    const breakdown = await screen.findByTestId('payment-breakdown')
    expect(breakdown).toBeInTheDocument()
    expect(breakdown).toHaveTextContent(/30%/)
  })

  it('muestra el monto de seña calculado en el aviso', async () => {
    getById.mockResolvedValue(
      makeReservation({
        depositPercentageSnapshot: 50,
        totalCents: 200000,
      }),
    )
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    const breakdown = await screen.findByTestId('payment-breakdown')
    expect(breakdown).toHaveTextContent(/50%/)
    expect(breakdown).toHaveTextContent(/\$ 1\.000/)
  })
})

describe('PagarReservaPage — modo saldo (US-30)', () => {
  it('muestra el saldo pendiente y la fecha límite cuando la reserva está señada', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'pending_balance',
        totalCents: 100000,
        depositPercentageSnapshot: 30,
        depositPaidCents: 30000,
        depositPaidAt: '2026-05-20T10:00:00.000Z',
        balanceDueAt: '2026-12-01T10:00:00.000Z',
      }),
    )
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    // El saldo a pagar es total - seña = 70000.
    const deadline = await screen.findByTestId('balance-deadline')
    expect(deadline).toBeInTheDocument()
    expect(screen.getByText('$ 700')).toBeInTheDocument()
    // No muestra el aviso de seña del flujo de pago total.
    expect(screen.queryByTestId('payment-breakdown')).not.toBeInTheDocument()
  })
})
