import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { messagingApi } from '../api/messaging.api'
import { createWrapper } from '@/test/query-wrapper'
import { useUnreadCount } from './useUnreadCount'

vi.mock('../api/messaging.api')
const mockApi = vi.mocked(messagingApi)

const RID = '11111111-1111-1111-1111-111111111111'

const makeResponse = (
  items: { sentAt: string }[],
  lastSeenAt: string | null,
) => ({
  items: items.map((m, i) => ({
    id: `msg-${i}`,
    reservationId: RID,
    senderId: 'other',
    body: 'hola',
    ...m,
  })),
  lastSeenAt,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUnreadCount', () => {
  it('devuelve 0 cuando lastSeenAt es null (sin baseline del servidor)', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse(
      [{ sentAt: '2026-06-10T10:00:00.000Z' }],
      null,
    ))
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(0)
  })

  it('cuenta mensajes con sentAt posterior a lastSeenAt', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse(
      [
        { sentAt: '2026-06-09T10:00:00.000Z' },
        { sentAt: '2026-06-11T10:00:00.000Z' },
        { sentAt: '2026-06-12T10:00:00.000Z' },
      ],
      '2026-06-10T10:00:00.000Z',
    ))
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(2)
  })

  it('devuelve 0 cuando todos los mensajes son anteriores a lastSeenAt', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse(
      [{ sentAt: '2026-06-01T10:00:00.000Z' }],
      '2026-06-14T10:00:00.000Z',
    ))
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(0)
  })

  it('devuelve 0 cuando no hay mensajes', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse([], '2026-06-10T10:00:00.000Z'))
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(0)
  })

  it('no ejecuta la query cuando enabled=false', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse([], null))
    renderHook(() => useUnreadCount(RID, false), { wrapper: createWrapper() })
    await new Promise((r) => setTimeout(r, 50))
    expect(mockApi.listMessages).not.toHaveBeenCalled()
  })

  it('llama a listMessages sin parámetro after (el servidor aplica lastSeenAt)', async () => {
    mockApi.listMessages.mockResolvedValue(makeResponse([], '2026-06-14T10:00:00.000Z'))
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApi.listMessages).toHaveBeenCalledWith(RID)
  })
})
