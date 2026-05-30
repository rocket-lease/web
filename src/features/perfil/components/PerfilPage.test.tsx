import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PerfilPage } from './PerfilPage'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({ history: { back: vi.fn() } }),
  Link: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => <a {...rest}>{children}</a>,
}))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('@/features/auth/hooks/useVerificationStatus', () => ({
  useVerificationStatus: () => ({ status: { email: true }, loading: false }),
}))

vi.mock('@/features/perfil/hooks/useMyProfile', () => ({
  useMyProfile: () => ({
    data: {
      id: 'user-1',
      name: 'Juan Perez',
      email: 'juan@example.com',
      phone: '1123456789',
      avatarUrl: null,
      verificationStatus: 'verified',
      identityVerification: {
        status: 'verified',
        providerName: 'stub-identity-provider',
        providerRequestId: 'req-1',
        rejectionReason: null,
        submittedAt: '2026-05-25T12:00:00.000Z',
        reviewAfterAt: '2026-05-25T12:00:30.000Z',
        reviewedAt: '2026-05-25T12:00:30.000Z',
        verifiedAt: '2026-05-25T12:00:30.000Z',
      },
      driverLicenseVerification: {
        status: 'not_started',
        providerName: null,
        providerRequestId: null,
        rejectionReason: null,
        submittedAt: null,
        reviewAfterAt: null,
        reviewedAt: null,
        verifiedAt: null,
      },
      level: 'gold',
      reputationScore: 4.8,
      balanceInCents: 1250000,
      preferences: { transmission: null, accessibility: [], maxPriceDaily: null },
      autoAccept: false,
    },
    isLoading: false,
    isOwnProfile: true,
    uploadAvatar: vi.fn(),
    isUploadingAvatar: false,
  }),
}))

vi.mock('./OwnerVehiclesSection', () => ({
  OwnerVehiclesSection: () => null,
}))

vi.mock('./OwnerReviewsSection', () => ({
  OwnerReviewsSection: () => null,
}))

describe('PerfilPage', () => {
  it('muestra el saldo de Rocketokens', () => {
    render(<PerfilPage />)

    expect(screen.getByText(/Saldo disponible/i)).toBeInTheDocument()
    expect(screen.getByText(/12\.500/)).toBeInTheDocument()
  })
})