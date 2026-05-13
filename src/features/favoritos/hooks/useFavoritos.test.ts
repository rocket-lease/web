import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFavoritos, useFavoritoIds } from './useFavoritos'
import { favoritosApi } from '../api/favoritos.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/favoritos.api')
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, session: null, activeRole: 'conductor', isLoading: false }),
}))

const mockApi = vi.mocked(favoritosApi)

const VEHICLE_1 = '11111111-1111-1111-1111-111111111111'
const VEHICLE_2 = '22222222-2222-2222-2222-222222222222'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useFavoritos', () => {
  it('retorna lista vacía cuando la API responde con []', async () => {
    mockApi.list.mockResolvedValue([])

    const { result } = renderHook(() => useFavoritos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('retorna los favoritos que devuelve la API', async () => {
    const items = [
      { id: 'fav-1', vehicleId: VEHICLE_1, createdAt: new Date().toISOString() },
      { id: 'fav-2', vehicleId: VEHICLE_2, createdAt: new Date().toISOString() },
    ]
    mockApi.list.mockResolvedValue(items)

    const { result } = renderHook(() => useFavoritos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].vehicleId).toBe(VEHICLE_1)
  })

  it('usa query key ["favoritos", "list"]', async () => {
    mockApi.list.mockResolvedValue([])

    const { result } = renderHook(() => useFavoritos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApi.list).toHaveBeenCalledTimes(1)
  })
})

describe('useFavoritoIds', () => {
  it('devuelve Set vacío cuando no hay favoritos', async () => {
    mockApi.list.mockResolvedValue([])

    const { result } = renderHook(() => useFavoritoIds(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.size).toBeDefined())
    expect(result.current.size).toBe(0)
  })

  it('devuelve Set con los vehicleIds', async () => {
    mockApi.list.mockResolvedValue([
      { id: 'fav-1', vehicleId: VEHICLE_1, createdAt: new Date().toISOString() },
    ])

    const { result } = renderHook(() => useFavoritoIds(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.size).toBe(1))
    expect(result.current.has(VEHICLE_1)).toBe(true)
    expect(result.current.has(VEHICLE_2)).toBe(false)
  })
})
