import { apiClient } from '@/lib/api-client'
import {
  AdminPricingZonesResponseSchema,
  apiEndpoints,
  type AdminPricingZonesResponse,
} from '@rocket-lease/contracts'

export const adminPricingApi = {
  async getPricingZones(): Promise<AdminPricingZonesResponse> {
    const raw = await apiClient.get<unknown>(apiEndpoints.admin.pricingZones)
    return AdminPricingZonesResponseSchema.parse(raw)
  },
}
