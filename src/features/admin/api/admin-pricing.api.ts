import { apiClient } from '@/lib/api-client'
import {
  AdminPricingZonesResponseSchema,
  ClearDebugDataResponseSchema,
  EmitDebugSignalsResponseSchema,
  apiEndpoints,
  type AdminPricingZonesResponse,
  type ClearDebugDataResponse,
  type EmitDebugSignalsRequest,
  type EmitDebugSignalsResponse,
} from '@rocket-lease/contracts'

export const adminPricingApi = {
  async getPricingZones(): Promise<AdminPricingZonesResponse> {
    const raw = await apiClient.get<unknown>(apiEndpoints.admin.pricingZones)
    return AdminPricingZonesResponseSchema.parse(raw)
  },

  async emitDebugSignals(
    payload: EmitDebugSignalsRequest,
  ): Promise<EmitDebugSignalsResponse> {
    const raw = await apiClient.post<unknown>(
      apiEndpoints.admin.pricingDebugEmit,
      payload,
    )
    return EmitDebugSignalsResponseSchema.parse(raw)
  },

  async clearDebugData(): Promise<ClearDebugDataResponse> {
    const raw = await apiClient.delete<unknown>(
      apiEndpoints.admin.pricingDebugClear,
    )
    return ClearDebugDataResponseSchema.parse(raw)
  },
}
