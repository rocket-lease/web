import { httpClient } from '@/lib/http-client'
import type { FavoritoItem } from '../types'

export const favoritosApi = {
  async list(): Promise<FavoritoItem[]> {
    const { items } = await httpClient.get<{ items: FavoritoItem[] }>('/favorites')
    return items
  },

  async add(vehicleId: string): Promise<FavoritoItem> {
    return httpClient.post<FavoritoItem>('/favorites', { vehicleId })
  },

  async remove(vehicleId: string): Promise<void> {
    return httpClient.delete(`/favorites/${vehicleId}`)
  },
}
