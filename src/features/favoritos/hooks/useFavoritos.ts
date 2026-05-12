import { useQuery } from '@tanstack/react-query'
import { favoritosApi } from '../api/favoritos.api'
import type { FavoritoItem } from '../types'

export function useFavoritos() {
  return useQuery<FavoritoItem[]>({
    queryKey: ['favoritos', 'list'],
    queryFn: favoritosApi.list,
  })
}

export function useFavoritoIds(): Set<string> {
  const { data } = useFavoritos()
  return new Set(data?.map((f) => f.vehicleId) ?? [])
}
