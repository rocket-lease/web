import { httpClient } from '@/lib/http-client'
import type { FavoriteItem } from '@rocket-lease/contracts'

export const favoritosApi = {
  async list(): Promise<FavoriteItem[]> {
    const { items } = await httpClient.get<{ items: FavoriteItem[] }>('/favorites')
    return items
  },

  async add(vehicleId: string): Promise<FavoriteItem> {
    return httpClient.post<FavoriteItem>('/favorites', { vehicleId })
  },

  async remove(vehicleId: string): Promise<void> {
    return httpClient.delete(`/favorites/${vehicleId}`)
  },
}
