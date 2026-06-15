import { httpClient } from '@/lib/http-client'
import type { ListNotificationsResponse, UnreadCountResponse } from '@rocket-lease/contracts'

export const notificacionesApi = {
  list: () => httpClient.get<ListNotificationsResponse>('/notifications'),
  unreadCount: () => httpClient.get<UnreadCountResponse>('/notifications/unread-count'),
  markRead: (id: string) => httpClient.post<UnreadCountResponse>(`/notifications/${id}/read`, {}),
  markAllRead: () => httpClient.post<UnreadCountResponse>('/notifications/read-all', {}),
}
