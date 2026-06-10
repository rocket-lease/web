import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test/query-wrapper'
import { useReputation } from '../useReputation'
import { reputationApi } from '../../api/reputation'
import type { GetReputationResponse } from '@rocket-lease/contracts'

vi.mock('../../api/reputation')

const MOCK_REPUTATION: GetReputationResponse = {
  userId: 'user-1',
  asDriver: {
    score: 4.9,
    reviewCount: 15,
    badges: ['conductor_destacado'],
    isLowReputation: false,
    penaltyCount: 0,
  },
  asRenter: {
    score: 5.0,
    reviewCount: 2,
    badges: [],
    isLowReputation: false,
    penaltyCount: 0,
  },
}

describe('useReputation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtiene la reputación del usuario', async () => {
    const mockApi = vi.mocked(reputationApi)
    mockApi.get.mockResolvedValue(MOCK_REPUTATION)

    const { result } = renderHook(() => useReputation('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(MOCK_REPUTATION)
    expect(mockApi.get).toHaveBeenCalledWith('user-1')
  })

  it('no hace la peticion si el userId es vacio', () => {
    const { result } = renderHook(() => useReputation(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
