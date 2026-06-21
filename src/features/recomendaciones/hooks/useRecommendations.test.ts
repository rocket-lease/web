import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRecommendations } from './useRecommendations'
import { recomendacionesApi } from '../api/recomendaciones.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/recomendaciones.api', () => ({
  recomendacionesApi: {
    getRecommendations: vi.fn(),
  },
}))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, session: null, activeRole: 'conductor', isLoading: false, isAuthenticated: true }),
}))

const mockApi = vi.mocked(recomendacionesApi)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRecommendations', () => {
  it('retorna vacío cuando la API responde sin sección', async () => {
    mockApi.getRecommendations.mockResolvedValue({ section: '', vehicles: [] })

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.data).toEqual({ section: '', vehicles: [] })
  })

  it('retorna vehículos cuando la API responde con datos', async () => {
    const data = {
      section: 'Sugerido para vos',
      vehicles: [
        { id: 'v1', brand: 'Toyota', model: 'Corolla', year: 2024, transmission: 'Manual' as const, passengers: 5, isAccessible: false, basePriceCents: 50000, characteristics: ['GPS' as const, 'BLUETOOTH' as const], enabled: true, photos: ['https://i.com/1.jpg'], mileage: 10000, color: 'Rojo', trunkLiters: 400, isPromoted: false, autoAccept: false, demandMultiplier: 1, province: 'B', city: 'CABA' },
      ],
    }
    mockApi.getRecommendations.mockResolvedValue(data)

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.data!.vehicles).toHaveLength(1)
    expect(result.current.data!.section).toBe('Sugerido para vos')
  })

  it('tiene query key ["recomendaciones", "list"]', async () => {
    mockApi.getRecommendations.mockResolvedValue({ section: '', vehicles: [] })

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(mockApi.getRecommendations).toHaveBeenCalledTimes(1)
  })
})
