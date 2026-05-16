import { useQuery } from '@tanstack/react-query'
import { reservarApi } from '@/features/reservar/api/reservar.api'

export function useMyReservations() {
  return useQuery({
    queryKey: ['reservations', 'mine'],
    queryFn: () => reservarApi.listMine(),
  })
}
