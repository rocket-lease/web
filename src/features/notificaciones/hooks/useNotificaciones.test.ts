import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useNotificaciones,
  useUnreadNotificaciones,
  useMarkNotificaciones,
} from './useNotificaciones'
import { notificacionesApi } from '../api/notificaciones.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('../api/notificaciones.api')
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, session: null, activeRole: 'conductor', isLoading: false, isAuthenticated: true }),
}))

const mockApi = vi.mocked(notificacionesApi)

const notif = {
  id: 'a1111111-1111-1111-1111-111111111111',
  title: 'Reserva confirmada',
  body: 'Tu reserva del Toyota Corolla está confirmada.',
  url: '/reservas/x',
  imageUrl: null,
  readAt: null,
  createdAt: new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useNotificaciones', () => {
  it('returns the list with the unread count', async () => {
    mockApi.list.mockResolvedValue({ notifications: [notif], unreadCount: 1 })

    const { result } = renderHook(() => useNotificaciones(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.notifications).toHaveLength(1)
    expect(result.current.data?.unreadCount).toBe(1)
  })
})

describe('useUnreadNotificaciones', () => {
  it('selects just the unread count number', async () => {
    mockApi.unreadCount.mockResolvedValue({ unreadCount: 4 })

    const { result } = renderHook(() => useUnreadNotificaciones(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toBe(4))
  })
})

describe('useMarkNotificaciones', () => {
  it('marks a single notification as read', async () => {
    mockApi.markRead.mockResolvedValue({ unreadCount: 0 })

    const { result } = renderHook(() => useMarkNotificaciones(), { wrapper: createWrapper() })
    result.current.markRead.mutate(notif.id)

    await waitFor(() => expect(mockApi.markRead).toHaveBeenCalledWith(notif.id))
  })

  it('marks all notifications as read', async () => {
    mockApi.markAllRead.mockResolvedValue({ unreadCount: 0 })

    const { result } = renderHook(() => useMarkNotificaciones(), { wrapper: createWrapper() })
    result.current.markAllRead.mutate()

    await waitFor(() => expect(mockApi.markAllRead).toHaveBeenCalledTimes(1))
  })
})
