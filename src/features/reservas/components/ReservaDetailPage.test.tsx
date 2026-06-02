import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReservaDetailPage } from './ReservaDetailPage'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { createWrapper } from '@/test/query-wrapper'
import { fmt } from '@/lib/formatters'

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
      balanceInCents: 0,
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

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

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
  cancellationPolicy?: 'FLEXIBLE' | 'MODERATE' | 'STRICT' | null
  startAt?: string
  paidAt?: string | null
  discountTier?: { minimumDays: number; discountPercentage: number } | null
}

function makeReservation(opts: MakeOpts = {}) {
  const policy = opts.cancellationPolicy === undefined ? 'FLEXIBLE' : opts.cancellationPolicy
  const reservationRuleSet =
    policy === null
      ? null
      : {
          id: '55555555-5555-5555-5555-555555555555',
          rentalorId: RENT,
          cancellationPolicy: policy,
          depositPercentage: null,
          maxKilometrage: { type: 'UNLIMITED' as const },
          rentalTimeConstraints: {},
        }
  const basePriceCents = 50000
  const durationDays = opts.discountTier ? 3 : 2
  const subtotalCents = basePriceCents * durationDays
  const hasDiscount = opts.discountTier !== undefined ? opts.discountTier !== null : false
  const appliedDiscountTier = hasDiscount ? opts.discountTier! : null
  const discountCents = hasDiscount
    ? Math.floor((subtotalCents * opts.discountTier!.discountPercentage) / 100)
    : 0
  const totalCents = subtotalCents - discountCents
  return {
    id: RES,
    vehicleId: VEH,
    conductorId: CON,
    rentadorId: RENT,
    status: opts.status ?? 'pending_approval',
    startAt: opts.startAt ?? '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: opts.holdExpiresAt ?? '2026-05-17T10:00:00.000Z',
    totalCents,
    currency: 'ARS' as const,
    paymentMethod: null,
    walletProvider: null,
    contractAcceptedAt: '2026-05-16T10:00:00.000Z',
    paidAt: opts.paidAt ?? null,
    rejectionReason: opts.rejectionReason ?? null,
    transferCode: null,
    transferAlias: null,
    transferExpiresAt: null,
    createdAt: '2026-05-16T10:00:00.000Z',
    updatedAt: '2026-05-16T10:00:00.000Z',
    depositPercentageSnapshot: null,
    pricingSnapshot: {
      vehicleId: VEH,
      currency: 'ARS' as const,
      basePriceCents,
      durationDays,
      subtotalCents,
      appliedDiscountTier,
      appliedDiscountPercentage: hasDiscount ? opts.discountTier!.discountPercentage : 0,
      discountCents,
      totalCents,
    },
    basePriceCentsSnapshot: basePriceCents,
    cancellationPolicySnapshot: (policy ?? 'FLEXIBLE') as 'FLEXIBLE' | 'MODERATE' | 'STRICT',
    maxKilometrageSnapshot: { type: 'UNLIMITED' as const },
    rentalTimeConstraintsSnapshot: {},
    vehicle: { id: VEH, brand: 'Toyota', model: 'Etios', year: 2020, photo: null, reservationRuleSet },
    rentador: { id: RENT, name: 'Lucas', avatarUrl: null },
  }
}

function isoFromNow(offsetMs: number) {
  return new Date(Date.now() + offsetMs).toISOString()
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
    cancel.mockResolvedValue({
      id: RES,
      status: 'cancelled',
      refundCents: 0,
      balanceInCents: 0,
      currency: 'ARS',
      cancelledBy: 'conductor' as const,
      reputationPenalty: 0,
    })

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

describe('ReservaDetailPage (conductor) — confirmed cancellation', () => {
  it('muestra el CTA real de cancelar cuando la reserva ya está confirmada', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        paidAt: '2026-05-31T10:00:00.000Z',
        startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        cancellationPolicy: 'FLEXIBLE',
      }),
    )
    cancel.mockResolvedValue({
      id: RES,
      status: 'cancelled',
      refundCents: 100000,
      balanceInCents: 100000,
      currency: 'ARS',
      cancelledBy: 'conductor' as const,
      reputationPenalty: 0,
    })

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByRole('button', { name: /Cancelar reserva/i }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancelar reserva/i }))

    expect(await screen.findByText(/¿Cancelar la reserva\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent?.includes(`Sí, vas a recibir ${fmt.currency(100000)} RocketTokens de reembolso.`) === true,
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /Cancelar reserva/i })[1])

    await waitFor(() => expect(cancel).toHaveBeenCalledWith(RES))
  })
})

describe('ReservaDetailPage (conductor) — cancellation policy block', () => {
  it('muestra flexible con mensaje de reembolso total', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'pending_payment',
        startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        cancellationPolicy: 'FLEXIBLE',
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Recibirás un reembolso total si cancelás antes del/i),
    ).toBeInTheDocument()
  })

  it('muestra moderada con mensaje de 50%', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'pending_payment',
        cancellationPolicy: 'MODERATE',
        startAt: isoFromNow(3 * DAY_MS),
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Recibirás un reembolso del 50% si cancelás antes del/i),
    ).toBeInTheDocument()
  })

  it('muestra estricta vigente con deadline basado en paidAt', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        cancellationPolicy: 'STRICT',
        startAt: isoFromNow(5 * DAY_MS),
        paidAt: isoFromNow(-2 * DAY_MS),
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Podrás cancelar con reembolso hasta el/i),
    ).toBeInTheDocument()
  })

  it('muestra estricta vencida cuando paidAt + 7 días ya pasó', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        cancellationPolicy: 'STRICT',
        paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Esta reserva ya no tiene reembolso disponible/i),
    ).toBeInTheDocument()
  })

  it('muestra estricta vencida cuando faltan 48h o menos para el inicio', async () => {
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        cancellationPolicy: 'STRICT',
        startAt,
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Esta reserva ya no tiene reembolso disponible/i),
    ).toBeInTheDocument()
  })

  it('muestra flexible por defecto cuando no hay reglas configuradas', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'pending_payment',
        cancellationPolicy: null,
        startAt: isoFromNow(3 * DAY_MS),
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Política aplicada: Flexible/i),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/Recibirás un reembolso total si cancelás antes del/i),
    ).toBeInTheDocument()
  })
})

describe('ReservaDetailPage (conductor) — discount breakdown', () => {
  it('NO muestra breakdown de descuento cuando no hay descuento aplicado', async () => {
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        discountTier: null,
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(getById).toHaveBeenCalled())
    expect(screen.queryByText(/Desglose del precio/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Aplica desde/i)).not.toBeInTheDocument()
  })

  it('muestra breakdown de descuento cuando hay descuento aplicado', async () => {
    const discountTier = { minimumDays: 3, discountPercentage: 15 }
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        discountTier,
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(await screen.findByText(/Desglose del precio/i)).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText(/Aplica desde 3 días \(-15%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Ahorro total/i)).toBeInTheDocument()
    expect(screen.getByText(/Alquiler original/i)).toBeInTheDocument()

    const titleEl = await screen.findByText(/Desglose del precio/i)
    const breakdownCard = titleEl.closest('div')!
    expect(breakdownCard.textContent).toMatch(/1\.500/)
    expect(breakdownCard.textContent).toMatch(/225/)
    expect(breakdownCard.textContent).toMatch(/1\.275/)
  })
})

describe('ReservaDetailPage (rentador) — discount breakdown', () => {
  it('NO muestra breakdown de descuento cuando no hay descuento aplicado', async () => {
    mockUser.current = { id: RENT }
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        discountTier: null,
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    await waitFor(() => expect(getById).toHaveBeenCalled())
    expect(screen.queryByText(/Desglose del precio/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Aplica desde/i)).not.toBeInTheDocument()
  })

  it('muestra breakdown de descuento cuando hay descuento aplicado', async () => {
    mockUser.current = { id: RENT }
    const discountTier = { minimumDays: 3, discountPercentage: 15 }
    getById.mockResolvedValue(
      makeReservation({
        status: 'confirmed',
        discountTier,
      }),
    )

    render(<ReservaDetailPage />, { wrapper: createWrapper() })

    expect(await screen.findByText(/Desglose del precio/i)).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText(/Aplica desde 3 días \(-15%\)/)).toBeInTheDocument()
    expect(screen.getByText(/Ahorro total/i)).toBeInTheDocument()
    expect(screen.getByText(/Alquiler original/i)).toBeInTheDocument()

    const titleEl = await screen.findByText(/Desglose del precio/i)
    const breakdownCard = titleEl.closest('div')!
    expect(breakdownCard.textContent).toMatch(/1\.500/)
    expect(breakdownCard.textContent).toMatch(/225/)
    expect(breakdownCard.textContent).toMatch(/1\.275/)
  })
})
