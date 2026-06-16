import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationList } from './NotificationList'

const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

const markReadMutate = vi.fn()
const markAllReadMutate = vi.fn()
const state: {
  data: { notifications: unknown[]; unreadCount: number } | undefined
  isLoading: boolean
  isError: boolean
} = { data: undefined, isLoading: false, isError: false }

vi.mock('../hooks/useNotificaciones', () => ({
  useNotificaciones: () => ({ data: state.data, isLoading: state.isLoading, isError: state.isError }),
  useMarkNotificaciones: () => ({
    markRead: { mutate: markReadMutate },
    markAllRead: { mutate: markAllReadMutate, isPending: false },
  }),
}))

const unread = {
  id: 'n1',
  title: 'Reserva confirmada',
  body: 'Tu reserva del Toyota Corolla está confirmada.',
  url: '/reservas/x',
  readAt: null,
  createdAt: new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
  state.data = undefined
  state.isLoading = false
  state.isError = false
})

describe('NotificationList', () => {
  it('shows the empty state when there are no notifications', () => {
    state.data = { notifications: [], unreadCount: 0 }
    render(<NotificationList />)
    expect(screen.getByText('No tenés notificaciones')).toBeInTheDocument()
  })

  it('shows a distinct error state on fetch failure (not the empty state)', () => {
    state.isError = true
    render(<NotificationList />)
    expect(screen.getByText('No pudimos cargar tus notificaciones')).toBeInTheDocument()
    expect(screen.queryByText('No tenés notificaciones')).not.toBeInTheDocument()
  })

  it('does not navigate to non-internal urls', () => {
    state.data = {
      notifications: [{ ...unread, url: 'https://evil.example/x' }],
      unreadCount: 1,
    }
    render(<NotificationList />)
    fireEvent.click(screen.getByText('Reserva confirmada'))
    expect(markReadMutate).toHaveBeenCalledWith('n1')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('renders notifications and opens the deep-link on click, marking it read', () => {
    state.data = { notifications: [unread], unreadCount: 1 }
    render(<NotificationList />)

    expect(screen.getByText('Reserva confirmada')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Reserva confirmada'))

    expect(markReadMutate).toHaveBeenCalledWith('n1')
    expect(navigateMock).toHaveBeenCalledWith({ to: '/reservas/x' })
  })

  it('does not re-mark an already read notification', () => {
    state.data = {
      notifications: [{ ...unread, readAt: new Date().toISOString() }],
      unreadCount: 0,
    }
    render(<NotificationList />)
    fireEvent.click(screen.getByText('Reserva confirmada'))
    expect(markReadMutate).not.toHaveBeenCalled()
  })

  it('marks all as read from the header action', () => {
    state.data = { notifications: [unread], unreadCount: 1 }
    render(<NotificationList />)
    fireEvent.click(screen.getByText('Marcar todas como leídas'))
    expect(markAllReadMutate).toHaveBeenCalledTimes(1)
  })
})
