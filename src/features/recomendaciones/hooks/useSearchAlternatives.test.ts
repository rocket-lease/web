import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSearchAlternatives } from './useSearchAlternatives'
import { alternativasApi } from '../api/alternativas.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/alternativas.api')

const mockApi = vi.mocked(alternativasApi)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSearchAlternatives', () => {
  it('no dispara query cuando no hay filtros', async () => {
    const { result } = renderHook(() => useSearchAlternatives({}), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(mockApi.getSearchAlternatives).not.toHaveBeenCalled()
  })

  it('no dispara query cuando los filtros están vacíos', async () => {
    const { result } = renderHook(() => useSearchAlternatives({ brand: '', model: '' }), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(mockApi.getSearchAlternatives).not.toHaveBeenCalled()
  })

  it('dispara query cuando hay filtros', async () => {
    mockApi.getSearchAlternatives.mockResolvedValue({ alternatives: [], message: undefined })

    const { result } = renderHook(() => useSearchAlternatives({ brand: 'Toyota' }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApi.getSearchAlternatives).toHaveBeenCalledWith({ brand: 'Toyota' })
  })

  it('retorna alternativas cuando hay resultados', async () => {
    const response = {
      alternatives: [
        {
          vehicle: { id: 'v1', brand: 'Honda', model: 'Civic', year: 2023, transmission: 'Manual' as const, passengers: 5, isAccessible: false, basePriceCents: 45000, characteristics: ['GPS' as const], enabled: true, photos: ['https://i.com/1.jpg'], mileage: 5000, color: 'Azul', trunkLiters: 400, isPromoted: false, autoAccept: false, demandMultiplier: 1, province: 'B', city: 'CABA' },
          differences: ['Cambia marca: Toyota → Honda'],
        },
      ],
      message: undefined,
    }
    mockApi.getSearchAlternatives.mockResolvedValue(response)

    const { result } = renderHook(() => useSearchAlternatives({ brand: 'Toyota' }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data!.alternatives).toHaveLength(1)
    expect(result.current.data!.alternatives[0].differences[0]).toContain('Honda')
  })

  it('retorna mensaje cuando no hay alternativas', async () => {
    mockApi.getSearchAlternatives.mockResolvedValue({ alternatives: [], message: 'No hay alternativas cercanas disponibles' })

    const { result } = renderHook(() => useSearchAlternatives({ brand: 'Toyota' }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data!.message).toBe('No hay alternativas cercanas disponibles')
  })

  it('tiene query key con los params', async () => {
    mockApi.getSearchAlternatives.mockResolvedValue({ alternatives: [], message: undefined })

    const params = { brand: 'Toyota', maxPriceCents: 50000 }
    const { result } = renderHook(() => useSearchAlternatives(params), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApi.getSearchAlternatives).toHaveBeenCalledWith(params)
  })
})
