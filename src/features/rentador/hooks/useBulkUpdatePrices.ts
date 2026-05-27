import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BulkPriceUpdateRequest } from '@rocket-lease/contracts'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'

/**
 * Mutation para actualizar precios de múltiples vehículos en un solo request.
 * Al resolver con éxito invalida la lista de vehículos propios.
 */
export function useBulkUpdatePrices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BulkPriceUpdateRequest) => vehiclesApi.bulkUpdatePrices(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', 'mine'] }),
  })
}
