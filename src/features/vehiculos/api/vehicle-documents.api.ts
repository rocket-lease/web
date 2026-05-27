import { apiClient } from '@/lib/api-client'
import {
  GetVehicleDocumentStatusResponseSchema,
  RequiredDocumentsResponseSchema,
  SubmitVehicleDocumentsResponseSchema,
  type GetVehicleDocumentStatusResponse,
  type SubmitVehicleDocumentsResponse,
} from '@rocket-lease/contracts'

export const vehicleDocumentsApi = {
  async getRequiredDocuments(vehicleId: string): Promise<string[]> {
    const res = await apiClient.get<unknown>(`/vehicle/${vehicleId}/documents/required`)
    return RequiredDocumentsResponseSchema.parse(res).requiredDocuments
  },

  async submitDocuments(
    vehicleId: string,
    payload: { title: File; greenCard: File },
  ): Promise<SubmitVehicleDocumentsResponse> {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('greenCard', payload.greenCard)
    const res = await apiClient.postFormData<unknown>(`/vehicle/${vehicleId}/documents`, formData)
    return SubmitVehicleDocumentsResponseSchema.parse(res)
  },

  async getDocumentStatus(vehicleId: string): Promise<GetVehicleDocumentStatusResponse> {
    const res = await apiClient.get<unknown>(`/vehicle/${vehicleId}/documents/status`)
    return GetVehicleDocumentStatusResponseSchema.parse(res)
  },
}
