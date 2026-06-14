import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useToggleFavorito } from './useToggleFavorito'
import { favoritosApi } from '../api/favoritos.api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

vi.mock('../api/favoritos.api')
vi.mock('sonner')

const mockApi = vi.mocked(favoritosApi)
const mockToast = vi.mocked(toast) as ReturnType<typeof vi.fn> & typeof toast

const VEHICLE_ID = '11111111-1111-1111-1111-111111111111'
const now = new Date().toISOString()
const UNDO_DELAY_MS = 3500

beforeEach(() => {
  vi.clearAllMocks()
})

function createWrapperWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

describe('useToggleFavorito', () => {
  describe('toggle — agregar favorito', () => {
    it('llama a favoritosApi.add cuando isFavorito es false', async () => {
      mockApi.add.mockResolvedValue({ id: 'fav-1', vehicleId: VEHICLE_ID, createdAt: now })

      const { wrapper } = createWrapperWithClient()
      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, false))

      await waitFor(() => expect(mockApi.add).toHaveBeenCalledWith(VEHICLE_ID))
    })

    it('actualización optimista agrega el item antes de la respuesta del servidor', async () => {
      let resolveAdd!: (v: any) => void
      mockApi.add.mockReturnValue(new Promise((r) => { resolveAdd = r }))

      const { queryClient, wrapper } = createWrapperWithClient()
      queryClient.setQueryData(['favoritos', 'list'], [])

      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, false))

      await waitFor(() => {
        const cache = queryClient.getQueryData<any[]>(['favoritos', 'list']) ?? []
        return cache.some((f) => f.vehicleId === VEHICLE_ID)
      })

      resolveAdd({ id: 'fav-1', vehicleId: VEHICLE_ID, createdAt: now })
    })

    it('revierte la actualización optimista si el servidor falla', async () => {
      mockApi.add.mockRejectedValue(new Error('network error'))

      const { queryClient, wrapper } = createWrapperWithClient()
      const initialList = [{ id: 'fav-0', vehicleId: 'otro-id', createdAt: now }]
      queryClient.setQueryData(['favoritos', 'list'], initialList)

      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, false))

      await waitFor(() => !result.current.isLoading)

      const cache = queryClient.getQueryData<any[]>(['favoritos', 'list']) ?? []
      expect(cache).toEqual(initialList)
    })
  })

  describe('toggle — eliminar favorito', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('actualización optimista elimina el item inmediatamente del cache', () => {
      const initialList = [{ id: 'fav-1', vehicleId: VEHICLE_ID, createdAt: now }]
      const { queryClient, wrapper } = createWrapperWithClient()
      queryClient.setQueryData(['favoritos', 'list'], initialList)

      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, true))

      const cache = queryClient.getQueryData<any[]>(['favoritos', 'list']) ?? []
      expect(cache.some((f) => f.vehicleId === VEHICLE_ID)).toBe(false)
    })

    it('llama a favoritosApi.remove después del tiempo de espera', async () => {
      mockApi.remove.mockResolvedValue(undefined)

      const { wrapper } = createWrapperWithClient()
      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, true))

      expect(mockApi.remove).not.toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(UNDO_DELAY_MS)
        await Promise.resolve()
      })

      expect(mockApi.remove).toHaveBeenCalledWith(VEHICLE_ID)
    })

    it('no llama a favoritosApi.remove si el usuario deshace la acción, y restaura el cache', async () => {
      const initialList = [{ id: 'fav-1', vehicleId: VEHICLE_ID, createdAt: now }]
      const { queryClient, wrapper } = createWrapperWithClient()
      queryClient.setQueryData(['favoritos', 'list'], initialList)

      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, true))

      // Simular click en "Deshacer"
      const toastCall = (mockToast as any).mock.calls.find(
        (call: any[]) => call[1]?.action?.label !== undefined,
      )
      expect(toastCall).toBeDefined()
      act(() => toastCall[1].action.onClick())

      await act(async () => {
        vi.advanceTimersByTime(UNDO_DELAY_MS)
        await Promise.resolve()
      })

      expect(mockApi.remove).not.toHaveBeenCalled()
      const cache = queryClient.getQueryData<any[]>(['favoritos', 'list']) ?? []
      expect(cache).toEqual(initialList)
      // La query debe quedar invalidada para revalidar contra el servidor
      const queryState = queryClient.getQueryState(['favoritos', 'list'])
      expect(queryState?.isInvalidated).toBe(true)
    })

    it('revierte la lista si el servidor falla al eliminar', async () => {
      mockApi.remove.mockRejectedValue(new Error('server error'))

      const initialList = [{ id: 'fav-1', vehicleId: VEHICLE_ID, createdAt: now }]
      const { queryClient, wrapper } = createWrapperWithClient()
      queryClient.setQueryData(['favoritos', 'list'], initialList)

      const { result } = renderHook(() => useToggleFavorito(), { wrapper })

      act(() => result.current.toggle(VEHICLE_ID, true))

      await act(async () => {
        vi.advanceTimersByTime(UNDO_DELAY_MS)
        await Promise.resolve()
        await Promise.resolve()
      })

      const cache = queryClient.getQueryData<any[]>(['favoritos', 'list']) ?? []
      expect(cache).toEqual(initialList)
    })
  })
})
