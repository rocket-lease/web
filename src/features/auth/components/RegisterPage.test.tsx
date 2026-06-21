import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterPage } from './RegisterPage'
import { authApi } from '../api/auth.api'
import { createWrapper } from '@/test/query-wrapper'
import { ErrorCodes } from '@rocket-lease/contracts'
import { toast } from 'sonner'

vi.mock('../api/auth.api', () => ({
  authApi: {
    signUp: vi.fn(),
    resendEmailOtp: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockSignUp = vi.mocked(authApi.signUp)
const mockResend = vi.mocked(authApi.resendEmailOtp)
const mockToastError = vi.mocked(toast.error)

const VALID_EMAIL = 'ana@example.com'

async function triggerPendingVerificationBanner() {
  mockSignUp.mockRejectedValue({ code: ErrorCodes.EMAIL_UNVERIFIED_PENDING })
  render(<RegisterPage />, { wrapper: createWrapper() })

  fireEvent.change(screen.getByPlaceholderText('Ana García'), { target: { value: 'Ana García' } })
  fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: VALID_EMAIL } })
  fireEvent.change(screen.getByPlaceholderText('12.345.678'), { target: { value: '12345678' } })
  fireEvent.change(screen.getByPlaceholderText('+54 9 11 1234-5678'), { target: { value: '+5491112345678' } })
  const passwordInputs = screen.getAllByPlaceholderText('••••••••')
  fireEvent.change(passwordInputs[0], { target: { value: 'Pass1234' } })
  fireEvent.change(passwordInputs[1], { target: { value: 'Pass1234' } })
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

  await screen.findByRole('button', { name: /reenviar código/i })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('RegisterPage — banner EMAIL_UNVERIFIED_PENDING', () => {
  it('muestra el banner amber y no navega cuando el backend devuelve EMAIL_UNVERIFIED_PENDING', async () => {
    await triggerPendingVerificationBanner()

    expect(screen.getByRole('button', { name: /reenviar código/i })).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handleResend llama a resendEmailOtp con el email y navega a /verificar', async () => {
    mockResend.mockResolvedValue(undefined)
    await triggerPendingVerificationBanner()

    fireEvent.click(screen.getByRole('button', { name: /reenviar código/i }))

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith(VALID_EMAIL)
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/verificar',
      search: { channel: 'email', email: VALID_EMAIL },
    })
  })

  it('handleResend muestra toast de error y no navega si resendEmailOtp falla', async () => {
    mockResend.mockRejectedValue(new Error('network error'))
    await triggerPendingVerificationBanner()

    fireEvent.click(screen.getByRole('button', { name: /reenviar código/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /reenviar código/i })).toBeInTheDocument()
  })

  it('no muestra el banner cuando el error es ENTITY_ALREADY_EXISTS', async () => {
    mockSignUp.mockRejectedValue({ code: ErrorCodes.ENTITY_ALREADY_EXISTS })
    render(<RegisterPage />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText('Ana García'), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: VALID_EMAIL } })
    fireEvent.change(screen.getByPlaceholderText('12.345.678'), { target: { value: '12345678' } })
    fireEvent.change(screen.getByPlaceholderText('+54 9 11 1234-5678'), { target: { value: '+5491112345678' } })
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwordInputs[0], { target: { value: 'Pass1234' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'Pass1234' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
    expect(screen.queryByRole('button', { name: /reenviar código/i })).not.toBeInTheDocument()
  })
})
