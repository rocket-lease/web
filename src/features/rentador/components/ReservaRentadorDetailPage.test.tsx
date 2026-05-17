import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReservaRentadorDetailPage } from './ReservaRentadorDetailPage'
import * as ownerApi from '../api/owner-reservations.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/owner-reservations.api')

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to: _to,
    ...rest
  }: {
    children: React.ReactNode
    to?: string
    [key: string]: unknown
  }) => <a {...rest}>{children}</a>,
  useRouter: () => ({ history: { back: vi.fn() } }),
  useParams: () => ({ id: '44444444-4444-4444-4444-444444444444' }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const RENT = '11111111-1111-1111-1111-111111111111'
const VEH = '22222222-2222-2222-2222-222222222222'
const CON = '33333333-3333-3333-3333-333333333333'
const RES = '44444444-4444-4444-4444-444444444444'

const fetchOwner = vi.mocked(ownerApi.fetchOwnerReservations)
const approve = vi.mocked(ownerApi.approveReservation)
const reject = vi.mocked(ownerApi.rejectReservation)

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
    holdExpiresAt: '2026-05-17T10:00:00.000Z',
    totalCents: 100000,
    currency: 'ARS' as const,
    paymentMethod: null,
    paidAt: null,
    rejectionReason: opts.rejectionReason ?? null,
    createdAt: '2026-05-16T10:00:00.000Z',
    updatedAt: '2026-05-16T10:00:00.000Z',
    vehicle: { id: VEH, brand: 'Toyota', model: 'Etios', year: 2020, photo: null },
    conductor: { id: CON, name: 'Julian', avatarUrl: null },
    rentador: { id: RENT, name: 'Lucas', avatarUrl: null },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReservaRentadorDetailPage — solicitudes pending_approval', () => {
  it('muestra los botones Aprobar y Rechazar cuando la reserva está en pending_approval', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'pending_approval' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('button', { name: /Aprobar/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rechazar/ })).toBeInTheDocument()
  })

  it('no muestra los botones cuando la reserva NO está en pending_approval', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'confirmed' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    await screen.findByText(/Toyota/i)
    expect(screen.queryByRole('button', { name: /^Aprobar$/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Rechazar$/ })).not.toBeInTheDocument()
  })

  it('al confirmar Aprobar dispara approveReservation con el id correcto', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'pending_approval' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })
    approve.mockResolvedValue({
      id: RES,
      status: 'pending_payment',
      holdExpiresAt: '2026-05-16T10:10:00.000Z',
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /^Aprobar$/ }))

    await screen.findByText(/Aprobar solicitud/i)
    const aprobarButtons = screen.getAllByRole('button', { name: /^Aprobar$/ })
    fireEvent.click(aprobarButtons[aprobarButtons.length - 1])

    await waitFor(() => expect(approve).toHaveBeenCalledWith(RES))
  })

  it('el modal de rechazo limita el textarea a 280 chars (maxLength)', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'pending_approval' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /Rechazar/ }))

    const textarea = (await screen.findByPlaceholderText(
      /vehículo en mantenimiento/i,
    )) as HTMLTextAreaElement
    expect(textarea.maxLength).toBe(280)
  })

  it('al confirmar el rechazo con razón llama rejectReservation con esa razón', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'pending_approval' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })
    reject.mockResolvedValue({
      id: RES,
      status: 'rejected',
      rejectionReason: 'En el taller',
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /Rechazar/ }))
    const textarea = await screen.findByPlaceholderText(
      /vehículo en mantenimiento/i,
    )
    fireEvent.change(textarea, { target: { value: 'En el taller' } })

    const buttons = screen.getAllByRole('button', { name: /^Rechazar$/ })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(reject).toHaveBeenCalledWith(RES, 'En el taller'),
    )
  })

  it('al confirmar el rechazo SIN razón llama rejectReservation con undefined', async () => {
    fetchOwner.mockResolvedValue({
      items: [makeReservation({ status: 'pending_approval' })],
      page: 1,
      pageSize: 100,
      total: 1,
    })
    reject.mockResolvedValue({
      id: RES,
      status: 'rejected',
      rejectionReason: null,
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /Rechazar/ }))
    const buttons = await screen.findAllByRole('button', { name: /^Rechazar$/ })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => expect(reject).toHaveBeenCalledWith(RES, undefined))
  })

  it('muestra la razón del rechazo cuando la reserva está en estado rejected', async () => {
    fetchOwner.mockResolvedValue({
      items: [
        makeReservation({
          status: 'rejected',
          rejectionReason: 'Vehículo en mantenimiento',
        }),
      ],
      page: 1,
      pageSize: 100,
      total: 1,
    })

    render(<ReservaRentadorDetailPage />, { wrapper: createWrapper() })

    expect(
      await screen.findByText(/Vehículo en mantenimiento/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Motivo del rechazo/i)).toBeInTheDocument()
  })
})
