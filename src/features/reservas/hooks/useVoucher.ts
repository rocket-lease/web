import { useQuery } from '@tanstack/react-query'
import { reservarApi } from '@/features/reservar/api/reservar.api'

export function useVoucher(reservationId: string) {
  return useQuery({
    queryKey: ['voucher', reservationId],
    queryFn: () => reservarApi.getVoucher(reservationId),
    enabled: !!reservationId,
    // Keep it cached for offline usage
    gcTime: Infinity,
    staleTime: 5 * 60 * 1000,
  })
}
