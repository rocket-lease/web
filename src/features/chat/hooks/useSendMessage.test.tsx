import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSendMessage } from './useSendMessage'
import { messagingApi } from '../api/messaging.api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/messaging.api')

const mockApi = vi.mocked(messagingApi)

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'
const USER_ID = 'user-aaa'
const queryKey = ['messages', RESERVATION_ID] as const
const now = new Date().toISOString()

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

describe('useSendMessage', () => {
  it('actualización optimista agrega el mensaje al cache antes de la respuesta del servidor', async () => {
    let resolveSend!: (v: any) => void
    mockApi.sendMessage.mockReturnValue(new Promise((r) => { resolveSend = r }))

    const { queryClient, wrapper } = createWrapperWithClient()
    queryClient.setQueryData(queryKey, { items: [] })

    const { result } = renderHook(() => useSendMessage(RESERVATION_ID, USER_ID), { wrapper })

    act(() => result.current.mutate('hola'))

    await waitFor(() => {
      const cache = queryClient.getQueryData<any>(queryKey) ?? {}
      return cache.items?.some((m: any) => m.body === 'hola' && m.senderId === USER_ID)
    })

    resolveSend({ id: 'msg-new', reservationId: RESERVATION_ID, senderId: USER_ID, body: 'hola', sentAt: now })
  })

  it('revierte el cache si el servidor falla', async () => {
    mockApi.sendMessage.mockRejectedValue(new Error('network error'))

    const { queryClient, wrapper } = createWrapperWithClient()
    const initialList = { items: [{ id: 'msg-0', reservationId: RESERVATION_ID, senderId: 'other', body: 'hey', sentAt: now }] }
    queryClient.setQueryData(queryKey, initialList)

    const { result } = renderHook(() => useSendMessage(RESERVATION_ID, USER_ID), { wrapper })

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    act(() => result.current.mutate('hola'))

    await waitFor(() => !result.current.isPending)

    const rollbackCall = setQueryDataSpy.mock.calls.find(
      (call) => JSON.stringify(call[1]) === JSON.stringify(initialList)
    )
    expect(rollbackCall).toBeDefined()
  })

  it('invalida la query de mensajes al settled (éxito)', async () => {
    mockApi.sendMessage.mockResolvedValue({ id: 'msg-new', reservationId: RESERVATION_ID, senderId: USER_ID, body: 'hola', sentAt: now })

    const { queryClient, wrapper } = createWrapperWithClient()
    queryClient.setQueryData(queryKey, { items: [] })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSendMessage(RESERVATION_ID, USER_ID), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('hola')
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
  })
})
