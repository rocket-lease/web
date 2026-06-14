import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { messagingApi } from '../api/messaging.api'
import { createWrapper } from '@/test/query-wrapper'
import { useUnreadCount, getLastSeen, markAsRead } from './useUnreadCount'

vi.mock('@/features/auth/hooks/useAuth')
vi.mock('../api/messaging.api')

const mockUseAuth = vi.mocked(useAuth)
const mockApi = vi.mocked(messagingApi)

const RID = '11111111-1111-1111-1111-111111111111'
const STORED_TS = '2026-06-10T10:00:00.000Z'
const LSKEY = 'rl:chat:lastSeen:' + RID

function authAs(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user: null,
    session: null,
    activeRole: 'conductor',
    setActiveRole: () => {},
    isLoading: false,
    signOut: async () => {},
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  authAs(true)
  mockApi.listMessages.mockResolvedValue({ items: [] })
})

afterEach(() => {
  localStorage.clear()
})

describe('useUnreadCount', () => {
  it('usa el lastSeen guardado en localStorage para filtrar mensajes', async () => {
    localStorage.setItem(LSKEY, STORED_TS)
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApi.listMessages).toHaveBeenCalledWith(RID, STORED_TS)
  })

  it('cuenta correctamente los mensajes retornados como no leídos', async () => {
    localStorage.setItem(LSKEY, STORED_TS)
    mockApi.listMessages.mockResolvedValue({
      items: [
        { id: 'm1', reservationId: RID, senderId: 'other', body: 'hola', sentAt: '2026-06-11T00:00:00.000Z' },
        { id: 'm2', reservationId: RID, senderId: 'other', body: 'che', sentAt: '2026-06-12T00:00:00.000Z' },
      ],
    })
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(2)
  })

  it('devuelve 0 cuando el API no retorna mensajes nuevos', async () => {
    localStorage.setItem(LSKEY, STORED_TS)
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(0)
  })

  it('inicializa baseline en "ahora" cuando no hay lastSeen y el usuario está autenticado', async () => {
    const before = new Date().toISOString()
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const [, since] = mockApi.listMessages.mock.calls[0]
    expect(since).toBeDefined()
    // el baseline no puede ser anterior al momento de inicialización
    expect(since! >= before).toBe(true)
    // se persiste en localStorage para la próxima carga
    expect(getLastSeen(RID)).toBeDefined()
  })

  it('con baseline inicializado, el API recibe lastSeen en lugar de undefined', async () => {
    const { result } = renderHook(() => useUnreadCount(RID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const [, since] = mockApi.listMessages.mock.calls[0]
    // nunca debe llamarse sin lastSeen cuando el usuario está autenticado
    expect(since).not.toBeUndefined()
  })

  it('no inicializa baseline cuando el usuario NO está autenticado', async () => {
    authAs(false)
    renderHook(() => useUnreadCount(RID, false), { wrapper: createWrapper() })
    await act(async () => {})
    expect(getLastSeen(RID)).toBeUndefined()
    expect(mockApi.listMessages).not.toHaveBeenCalled()
  })

  it('no ejecuta la query cuando enabled=false', async () => {
    localStorage.setItem(LSKEY, STORED_TS)
    renderHook(() => useUnreadCount(RID, false), { wrapper: createWrapper() })
    await act(async () => {})
    expect(mockApi.listMessages).not.toHaveBeenCalled()
  })

  it('markAsRead actualiza el lastSeen en localStorage', () => {
    const before = new Date().toISOString()
    markAsRead(RID)
    const stored = getLastSeen(RID)
    expect(stored).toBeDefined()
    expect(stored! >= before).toBe(true)
  })
})
