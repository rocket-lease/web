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

    // Esperamos el render
    await waitFor(() => expect(getById).toHaveBeenCalled())
    expect(screen.queryByTestId('payment-breakdown')).not.toBeInTheDocument()
  })

  it('muestra el breakdown cuando depositPercentageSnapshot=30', async () => {
    getById.mockResolvedValue(
      makeReservation({
        depositPercentageSnapshot: 30,
        basePriceCentsSnapshot: 50000,
        totalCents: 100000,
      }),
    )
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    const breakdown = await screen.findByTestId('payment-breakdown')
    expect(breakdown).toBeInTheDocument()
    // 30% de 100.000 = 30.000 centavos = $300
    expect(breakdown).toHaveTextContent(/Seña \(30%\)/i)
  })

  it('calcula correctamente "A pagar ahora" = total × porcentaje', async () => {
    getById.mockResolvedValue(
      makeReservation({
        depositPercentageSnapshot: 50,
        totalCents: 200000,
      }),
    )
    render(<PagarReservaPage />, { wrapper: createWrapper() })

    const breakdown = await screen.findByTestId('payment-breakdown')
    // 50% de 200000 = 100000 cents → "$1.000"
    const collapsed = breakdown.textContent?.replace(/\s/g, '') ?? ''
    expect(collapsed).toMatch(/Apagarahora\$1\.000/)
    expect(collapsed).toMatch(/Restoalretirar\$1\.000/)
  })
})
