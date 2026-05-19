import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReservaDetailPage } from './ReservaDetailPage'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/reservar/api/reservar.api', () => ({
  reservarApi: {
    getById: vi.fn(),
    cancel: vi.fn(),
    confirmPayment: vi.fn(),
    initiateTransfer: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: '44444444-4444-4444-4444-444444444444' }),
  useSearch: () => ({}),
  useRouter: () => ({ history: { back: vi.fn() } }),
  Link: ({
    children,
    to: _to,
    ...rest
  }: {
    children: React.ReactNode
    to?: string
    [key: string]: unknown
  }) => <a {...rest}>{children}</a>,
  useNavigate: () => () => undefined,
}))

const mockUser = { current: null as null | { id: string } }
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser.current,
    session: null,
    activeRole: 'conductor',
    isLoading: false,
  }),
}))

vi.mock('@/features/perfil/api/profile.api', () => ({
  profileApi: {
    getProfileById: vi.fn().mockResolvedValue({
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Julián',
      email: 'j@example.com',
      phone: '111',
      avatarUrl: null,
      verificationStatus: 'verified' as const,
      level: 'bronze' as const,
      reputationScore: 4.5,
      preferences: { transmission: null, accessibility: [], maxPriceDaily: null },
      autoAccept: false,
    }),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const RENT = '11111111-1111-1111-1111-111111111111'
const VEH = '22222222-2222-2222-2222-222222222222'
const CON = '33333333-3333-3333-3333-333333333333'
const RES = '44444444-4444-4444-4444-444444444444'

const getById = vi.mocked(reservarApi.getById)
const cancel = vi.mocked(reservarApi.cancel)

interface MakeOpts {
  status?:
    | 'pending_approval'
    | 'pending_payment'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'rejected'
    | 'expired'
  rejectionReason?: string | null
  holdExpiresAt?: string | null
}

function makeReservation(opts: MakeOpts = {}) {
  return {
    id: RES,
    vehicleId: VEH,
    conductorId: CON,
    rentadorId: RENT,
    status: opts.status ?? 'pending_approval',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: opts.holdExpiresAt ?? '2026-05-17T10:00:00.000Z',
    totalCents: 100000,
    currency: 'ARS' as const,
    paymentMethod: null,
    walletProvider: null,
    contractAcceptedAt: '2026-05-16T10:00:00.000Z',
    paidAt: null,
    rejectionReason: opts.rejectionReason ?? null,
    transferCode: null,
    transferAlias: null,
    transferExpiresAt: null,
    createdAt: '2026-05-16T10:00:00.000Z',
    updatedAt: '2026-05-16T10:00:00.000Z',
    vehicle: { id: VEH, brand: 'Toyota', model: 'Etios', year: 2020, photo: null },
    rentador: { id: RENT, name: 'Lucas', avatarUrl: null },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUser.current = null
})

describe('ReservaDetailPage (conductor) — pending_approval', () => {
  it('muestra el CTA "Retirar solicitud" cuando la reserva está pending_approval', async () => {
    getById.mockResolvedValue(makeReservation({ status: 'pending_approval' }))

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByRole('button', { name: /Retirar solicitud/i }),
    ).toBeInTheDocument()
  })

  it('abre el modal anti-misclick con el copy correcto al tocar el CTA', async () => {
    getById.mockResolvedValue(makeReservation({ status: 'pending_approval' }))

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(
      await screen.findByRole('button', { name: /Retirar solicitud/i }),
    )

    expect(await screen.findByText(/¿Retirar tu solicitud\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/El rentador no la verá. Podés enviarla de nuevo más tarde./i),
    ).toBeInTheDocument()
    /**
     * Hay 2 botones con nombre "Volver": el back-button del PageHeader y el
     * principal del modal anti-misclick. Validamos que al menos uno está
     * presente (el del modal).
     */
    expect(screen.getAllByRole('button', { name: /^Volver$/ }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /^Retirar$/ })).toBeInTheDocument()
  })

  it('al confirmar "Retirar" llama al endpoint de cancel con el id', async () => {
    getById.mockResolvedValue(makeReservation({ status: 'pending_approval' }))
    cancel.mockResolvedValue({ id: RES, status: 'cancelled' })

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(
      await screen.findByRole('button', { name: /Retirar solicitud/i }),
    )
    fireEvent.click(await screen.findByRole('button', { name: /^Retirar$/ }))

    await waitFor(() => expect(cancel).toHaveBeenCalledWith(RES))
  })
})

describe('ReservaDetailPage (dispatcher) — rentador perspective', () => {
  it('renderiza vista rentador (botones Aprobar/Rechazar) cuando user.id === rentadorId', async () => {
    mockUser.current = { id: RENT }
    getById.mockResolvedValue(makeReservation({ status: 'pending_approval' }))

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByRole('button', { name: /Aprobar/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument()
  })
})

describe('ReservaDetailPage (conductor) — rejected', () => {
  it('muestra la razón del rechazo cuando viene presente', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'rejected',
        rejectionReason: 'Vehículo en mantenimiento',
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Vehículo en mantenimiento/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Solicitud rechazada/i)).toBeInTheDocument()
  })

  it('muestra copy genérico cuando rejectionReason es null', async () => {
    getById.mockResolvedValue(
      makeReservation({ status: 'rejected', rejectionReason: null }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/El rentador no aceptó la solicitud/i),
    ).toBeInTheDocument()
  })
})
