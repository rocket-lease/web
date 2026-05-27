import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { t } from '@/i18n/es'
import { promocionApi } from '../api/promocion.api'
import type { PromoteVehicleRequest } from '@rocket-lease/contracts'

const promotionQueryKeys = {
  durations: ['promotion', 'durations'] as const,
  vehiclePromotion: (vehicleId: string) => ['promotion', 'vehicle', vehicleId] as const,
}

export function usePromotionDurations() {
  return useQuery({
    queryKey: promotionQueryKeys.durations,
    queryFn: () => promocionApi.getDurations(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useVehiclePromotion(vehicleId: string | undefined) {
  return useQuery({
    queryKey: promotionQueryKeys.vehiclePromotion(vehicleId ?? ''),
    queryFn: () => promocionApi.getVehiclePromotion(vehicleId!),
    enabled: !!vehicleId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useVehiclePromotionPolling(vehicleId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: promotionQueryKeys.vehiclePromotion(vehicleId ?? ''),
    queryFn: () => promocionApi.getVehiclePromotion(vehicleId!),
    enabled: !!vehicleId && enabled,
    refetchInterval: 2000,
    staleTime: 0,
  })
}

export function usePromoteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: PromoteVehicleRequest }) =>
      promocionApi.promoteVehicle(vehicleId, data),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: promotionQueryKeys.vehiclePromotion(vehicleId) })
    },
    onError: () => {
      toast.error(t('promocionar.error'))
    },
  })
}
