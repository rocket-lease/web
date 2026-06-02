import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { messagingApi } from '../api/messaging.api'
import { createWrapper } from '@/test/query-wrapper'
import { useMessages } from './useMessages'

vi.mock('../api/messaging.api')
const mockApi = vi.mocked(messagingApi)

const RESERVATION_ID = '11111111-1111-1111-1111-111111111111'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMessages', () => {
  it('retorna lista vacía cuando no hay mensajes', async () => {
    mockApi.listMessages.mockResolvedValue({ items: [] })
    const { result } = renderHook(() => useMessages(RESERVATION_ID), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.items).toHaveLength(0)
  })

  it('retorna los mensajes de la reserva', async () => {
    const messages = [
      {
        id: 'msg-1',
        reservationId: RESERVATION_ID,
        senderId: 'u-1',
        body: 'hola',
        sentAt: '2026-06-01T10:00:00.000Z',
      },
    ]
    mockApi.listMessages.mockResolvedValue({ items: messages })
    const { result } = renderHook(() => useMessages(RESERVATION_ID), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.items[0].body).toBe('hola')
  })

  it('llama a listMessages con el reservationId correcto', async () => {
    mockApi.listMessages.mockResolvedValue({ items: [] })
    renderHook(() => useMessages(RESERVATION_ID), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(mockApi.listMessages).toHaveBeenCalled())
    expect(mockApi.listMessages).toHaveBeenCalledWith(RESERVATION_ID)
  })
})
