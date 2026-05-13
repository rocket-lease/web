import { useQuery } from '@tanstack/react-query'
import { favoritosApi } from '../api/favoritos.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { FavoritoItem } from '../types'

export function useFavoritos() {
  const { user } = useAuth()
  return useQuery<FavoritoItem[]>({
    queryKey: ['favoritos', 'list'],
    queryFn: favoritosApi.list,
    enabled: !!user,
  })
}

export function useFavoritoIds(): Set<string> {
  const { data } = useFavoritos()
  return new Set(data?.map((f) => f.vehicleId) ?? [])
}
