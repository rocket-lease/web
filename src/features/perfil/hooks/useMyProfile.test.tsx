import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper } from '@/test/query-wrapper'
import { useMyProfile } from './useMyProfile'
import { profileApi } from '@/features/perfil/api/profile.api'
import type { GetMyProfileResponse } from '@rocket-lease/contracts'

vi.mock('@/features/perfil/api/profile.api')
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'tok-123' },
    user: { id: 'user-abc' },
    activeRole: 'conductor',
    isLoading: false,
  }),
}))

const MOCK_PROFILE: GetMyProfileResponse = {
  id: 'user-abc',
  name: 'Juan Conductor',
  email: 'juan@test.com',
  phone: '1234567890',
  avatarUrl: null,
  verificationStatus: 'not_started',
  identityVerification: {
    status: 'not_started',
    providerName: null,
    providerRequestId: null,
    rejectionReason: null,
    submittedAt: null,
    reviewAfterAt: null,
    reviewedAt: null,
    verifiedAt: null,
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
  level: 'bronze',
  balanceInCents: 0,
  reputationScore: 0,
  preferences: { transmission: null, accessibility: [], maxPriceDaily: null },
  autoAccept: false,
  isAdmin: false,
}

describe('useMyProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtiene el perfil propio', async () => {
    const mockProfileApi = vi.mocked(profileApi)
    mockProfileApi.getMyProfile.mockResolvedValue(MOCK_PROFILE)

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(MOCK_PROFILE)
  })

  it('updateProfile llama a updateMyProfile y actualiza el cache', async () => {
    const mockProfileApi = vi.mocked(profileApi)
    mockProfileApi.getMyProfile.mockResolvedValue(MOCK_PROFILE)
    mockProfileApi.updateMyProfile.mockResolvedValue({
      ...MOCK_PROFILE,
      name: 'Nuevo Nombre',
    })

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateProfile({
        name: 'Nuevo Nombre',
        phone: '1234567890',
        avatarUrl: null,
        preferences: { transmission: null, accessibility: [], maxPriceDaily: null },
      })
    })

    expect(mockProfileApi.updateMyProfile).toHaveBeenCalledWith('tok-123', {
      name: 'Nuevo Nombre',
      phone: '1234567890',
      avatarUrl: null,
      preferences: { transmission: null, accessibility: [], maxPriceDaily: null },
    })
  })

  it('isUpdating es false cuando no hay mutación en curso', async () => {
    const mockProfileApi = vi.mocked(profileApi)
    mockProfileApi.getMyProfile.mockResolvedValue(MOCK_PROFILE)

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isUpdating).toBe(false)
  })
})
