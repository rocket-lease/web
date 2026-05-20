import { useQuery } from '@tanstack/react-query'
import { favoritosApi } from '../api/favoritos.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { FavoriteItem } from '@rocket-lease/contracts'

export function useFavoritos() {
  const { isAuthenticated } = useAuth()
  return useQuery<FavoriteItem[]>({
    queryKey: ['favoritos', 'list'],
    queryFn: favoritosApi.list,
    enabled: isAuthenticated,
  })
}

export function useFavoritoIds(): Set<string> {
  const { data } = useFavoritos()
  return new Set(data?.map((f) => f.vehicleId) ?? [])
}
