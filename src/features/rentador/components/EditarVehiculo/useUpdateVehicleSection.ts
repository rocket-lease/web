import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vehiclesApi, type UpdateVehicleRequest } from '@/features/vehiculos/api/vehiculos.api'
import { t } from '@/i18n/es'

const myVehiclesQueryKey = ['vehicles', 'mine'] as const
const vehicleQueryKey = (vehicleId: string) => ['vehicles', vehicleId] as const

interface Options {
  vehicleId: string
  onSuccess?: () => void
}

/**
 * Mutation reutilizable para que cada sheet de edición guarde sólo sus campos.
 * En éxito invalida las queries del vehículo, muestra un toast y opcionalmente
 * cierra el sheet (vía `onSuccess`).
 */
export function useUpdateVehicleSection({ vehicleId, onSuccess }: Options) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (partial: UpdateVehicleRequest) =>
      vehiclesApi.updateVehicle(vehicleId, partial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVehiclesQueryKey })
      queryClient.invalidateQueries({ queryKey: vehicleQueryKey(vehicleId) })
      toast.success(t('editVehiculo.saveSuccess'))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t('editVehiculo.saveError'))
    },
  })
}
