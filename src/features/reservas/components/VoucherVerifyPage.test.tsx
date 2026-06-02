import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VoucherVerifyPage } from './VoucherVerifyPage'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/reservar/api/reservar.api', () => ({
  reservarApi: {
    verifyVoucher: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ token: 'test-token-123' }),
  useRouter: () => ({ history: { back: vi.fn() } }),
  useNavigate: () => () => undefined,
  Link: ({ children, to: _to, ...rest }: { children: React.ReactNode; to?: string; [key: string]: unknown }) =>
    <a {...rest}>{children}</a>,
}))

const mockConfirmPickup = vi.fn()
vi.mock('../hooks/useConfirmPickup', () => ({
  useConfirmPickup: () => ({
    mutate: mockConfirmPickup,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}))

const mockUserId = { current: 'rentador-id' }
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: mockUserId.current } }),
}))

const baseVoucher = {
  reservationId: 'res-1',
  status: 'confirmed',
  conductor: { id: 'conductor-id', name: 'Juan Pérez', avatarUrl: null },
  rentador: { id: 'rentador-id', name: 'Carlos López', avatarUrl: null },
  vehicle: { id: 'veh-1', plate: 'AB123CD', brand: 'Toyota', model: 'Corolla', year: 2020, photo: null },
  startAt: '2026-06-01T10:00:00Z',
  endAt: '2026-06-05T10:00:00Z',
  paymentMethod: 'TRANSFER',
  totalCents: 50000,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(reservarApi.verifyVoucher).mockResolvedValue(baseVoucher as never)
})

describe('VoucherVerifyPage', () => {
  it('no llama a confirmPickup automáticamente cuando el voucher está confirmed', async () => {
    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    await screen.findByText('Juan Pérez')

    expect(mockConfirmPickup).not.toHaveBeenCalled()
  })

  it('muestra el botón Confirmar entrega cuando el voucher está confirmed', async () => {
    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('button', { name: /confirmar entrega/i })).toBeInTheDocument()
  })

  it('llama a confirmPickup al hacer click en Confirmar entrega', async () => {
    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /confirmar entrega/i }))

    expect(mockConfirmPickup).toHaveBeenCalledWith('test-token-123')
  })

  it('muestra el botón Los datos no coinciden', async () => {
    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    expect(await screen.findByRole('button', { name: /datos no coinciden/i })).toBeInTheDocument()
  })

  it('no muestra botones de acción si el voucher ya está in_progress', async () => {
    vi.mocked(reservarApi.verifyVoucher).mockResolvedValue({ ...baseVoucher, status: 'in_progress' } as never)

    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    await screen.findByText('Juan Pérez')

    expect(screen.queryByRole('button', { name: /confirmar entrega/i })).not.toBeInTheDocument()
    expect(mockConfirmPickup).not.toHaveBeenCalled()
  })

  it('no muestra botones de acción si el usuario logueado es el conductor', async () => {
    mockUserId.current = 'conductor-id'

    render(<VoucherVerifyPage />, { wrapper: createWrapper() })

    await screen.findByText('Juan Pérez')

    expect(screen.queryByRole('button', { name: /confirmar entrega/i })).not.toBeInTheDocument()
    expect(mockConfirmPickup).not.toHaveBeenCalled()

    mockUserId.current = 'rentador-id'
  })
})
